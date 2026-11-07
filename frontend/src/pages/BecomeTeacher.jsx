import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { requestTeacher } from "../api/auth";
import { msg } from "../api/http";
import GlassCard from "../components/ui/GlassCard";
import Bubble from "../components/ui/Bubble";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

const steps = [
  "You send a request (one click).",
  "An admin reviews it.",
  "Once approved, your account becomes a teacher account.",
];

export default function BecomeTeacher() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    setBusy(true);
    setErr("");
    try {
      await requestTeacher();
      setSent(true);
    } catch (x) {
      setErr(msg(x)); // e.g. "You already have a pending teacher role request."
    } finally {
      setBusy(false);
    }
  };

  if (user.role !== "student")
    return (
      <GlassCard className="panel narrow">
        <div className="center">
          <StatusOrb kind="ok" />
          <h1>You're already a {user.role}</h1>
          <p>Nothing to request. You have teacher access.</p>
          <Link to="/" className="soft">Back home</Link>
        </div>
      </GlassCard>
    );

  if (sent)
    return (
      <GlassCard className="panel narrow">
        <div className="center">
          <StatusOrb kind="sent" />
          <h1>Request sent</h1>
          <p>An admin will review it. You'll become a teacher as soon as it's approved.</p>
          <Link to="/" className="soft">Back home</Link>
        </div>
      </GlassCard>
    );

  return (
    <GlassCard className="panel narrow">
      <Bubble icon={GraduationCap} />
      <h1>Become a <span className="hl">teacher</span></h1>
      <p className="sub">Teachers can run communities, share videos and set assignments.</p>
      <ol className="how">
        {steps.map((t) => <li key={t}>{t}</li>)}
      </ol>
      <div className="form">
        {err && <Alert>{err}</Alert>}
        <Button loading={busy} onClick={send} icon={<Send size={18} />}>Send request</Button>
      </div>
    </GlassCard>
  );
}
