import { useCallback, useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { reviewTeacherRequest, teacherRequests } from "../api/auth";
import { msg } from "../api/http";
import { useToast } from "../context/ToastContext";
import { fmtDate } from "../utils/validate";
import GlassCard from "../components/ui/GlassCard";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

const TABS = ["pending", "approved", "rejected", "all"];

/** Admin only (guarded in App.jsx, and again by the backend). */
export default function TeacherRequests() {
  const toast = useToast();
  const [tab, setTab] = useState("pending");
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  const [working, setWorking] = useState(null);

  const load = useCallback(() => {
    let stale = false;
    setList(null);
    teacherRequests(tab === "all" ? undefined : tab)
      .then((d) => !stale && (setList(d), setErr("")))
      .catch((x) => !stale && (setErr(msg(x)), setList([])));
    return () => (stale = true);
  }, [tab]);

  useEffect(() => load(), [load]);

  const review = async (r, status) => {
    setWorking(r.id + status);
    try {
      await reviewTeacherRequest(r.id, status);
      toast.ok(`${r.user?.name || "User"} ${status}`);
      setList((l) => (tab === "all" ? l.map((x) => (x.id === r.id ? { ...x, status } : x)) : l.filter((x) => x.id !== r.id)));
    } catch (x) {
      toast.err(msg(x));
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <GlassCard className="panel" style={{ marginBottom: 22 }}>
        <h1>Teacher <span className="hl">requests</span></h1>
        <p className="sub">Approving a request makes that person a teacher.</p>
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </GlassCard>

      {err && <Alert>{err}</Alert>}

      {list === null ? (
        <div className="grid">{[0, 1, 2].map((i) => <div key={i} className="skel" />)}</div>
      ) : list.length === 0 ? (
        <GlassCard className="empty">
          <ShieldCheck size={36} />
          <h3>Nothing here</h3>
          <p>No {tab === "all" ? "" : tab} requests right now.</p>
        </GlassCard>
      ) : (
        <div className="grid">
          {list.map((r) => (
            <GlassCard key={r.id} className="person">
              <Avatar user={r.user} size={54} />
              <div className="who">
                <b>{r.user?.name} <span className={`status ${r.status}`}>{r.status}</span></b>
                <small>{r.user?.email}</small>
                <small>Requested {fmtDate(r.createdAt)}</small>
                {r.user?.bio && <p>{r.user.bio}</p>}
                {r.status === "pending" && (
                  <div className="actions">
                    <Button className="sm" loading={working === r.id + "approved"} disabled={!!working} onClick={() => review(r, "approved")} icon={<Check size={16} />}>Approve</Button>
                    <Button className="sm" variant="ghost" loading={working === r.id + "rejected"} disabled={!!working} onClick={() => review(r, "rejected")} icon={<X size={16} />}>Reject</Button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
