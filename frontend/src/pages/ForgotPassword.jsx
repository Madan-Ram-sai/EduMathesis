import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ShieldCheck } from "lucide-react";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { isEmail } from "../utils/validate";
import { Field } from "../components/ui/Field";
import StatusOrb from "../components/ui/StatusOrb";
import Bubble from "../components/ui/Bubble";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) return setErr("Enter a valid email address");
    setBusy(true);
    setErr("");
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (x) {
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <div className="center">
        <StatusOrb kind="sent" />
        <h1>Reset link sent</h1>
        <p>If an account exists for <b>{email.trim()}</b>, you'll get an email with a reset link shortly.</p>
        <Link to="/login" className="soft">Back to login</Link>
      </div>
    );

  return (
    <>
      <div className="head">
        <Bubble icon={Mail} />
        <h1>Forgot your <span className="hl">password?</span></h1>
        <p>No stress. Tell us your email and we'll send a reset link.</p>
      </div>
      <form className="form" onSubmit={submit} noValidate>
        {err && <Alert>{err}</Alert>}
        <Field label="Email" icon={Mail} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@college.edu" autoComplete="email" autoFocus />
        <div className="toast-card">
          <ShieldCheck size={20} color="var(--ok)" />
          <span><b>Check your spam folder too</b>The link works for a limited time only.</span>
        </div>
        <Button type="submit" loading={busy} icon={<Send size={18} />}>Send reset link</Button>
      </form>
      <p className="foot">Remembered it? <Link to="/login">Log in</Link></p>
    </>
  );
}
