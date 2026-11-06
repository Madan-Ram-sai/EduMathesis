import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { searchTeachers } from "../api/auth";
import { msg } from "../api/http";
import GlassCard from "../components/ui/GlassCard";
import Avatar from "../components/ui/Avatar";
import { Field } from "../components/ui/Field";
import Alert from "../components/ui/Alert";

export default function Teachers() {
  const [q, setQ] = useState("");
  const [list, setList] = useState(null); // null = loading
  const [err, setErr] = useState("");

  // debounced search; ignore stale responses
  useEffect(() => {
    let stale = false;
    setList(null);
    const t = setTimeout(() => {
      searchTeachers(q.trim())
        .then((d) => !stale && (setList(d), setErr("")))
        .catch((x) => !stale && (setErr(msg(x)), setList([])));
    }, 300);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <>
      <GlassCard className="panel" style={{ marginBottom: 22 }}>
        <h1>Find a <span className="hl">teacher</span></h1>
        <p className="sub">Search by name, username or email.</p>
        <div className="search">
          <Field label="Search" icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Prof. Rao" autoFocus />
        </div>
      </GlassCard>

      {err && <Alert>{err}</Alert>}

      {list === null ? (
        <div className="grid">{[0, 1, 2].map((i) => <div key={i} className="skel" />)}</div>
      ) : list.length === 0 ? (
        <GlassCard className="empty">
          <Users size={36} />
          <h3>No teachers found</h3>
          <p>{q ? "Try a different name or username." : "Teachers will appear here once admins approve them."}</p>
        </GlassCard>
      ) : (
        <div className="grid">
          {list.map((t) => (
            <GlassCard key={t.id} className="person">
              <Avatar user={t} size={54} />
              <div className="who">
                <b>{t.name} <span className={`role ${t.role}`}>{t.role}</span></b>
                {t.username && <small>@{t.username}</small>}
                {t.bio && <p>{t.bio}</p>}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
}
