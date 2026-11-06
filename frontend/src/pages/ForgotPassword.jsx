import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { isEmail } from "../utils/validate";
import { Field } from "../components/ui/Field";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Callout from "../components/ui/Callout";

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
        <Link to="/login" className="soft">Back to sign in</Link>
      </div>
    );

  return (
    <>
      <Badge icon={Mail} />
      <h1>Forgot your <span className="hl">password?</span></h1>
      <p className="sub">No stress. Tell us your email and we'll send a reset link.</p>
      <form className="form" onSubmit={submit} noValidate style={{ marginTop: 0 }}>
        {err && <Alert>{err}</Alert>}
        <Field label="Email" icon={Mail} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@college.edu" autoComplete="email" autoFocus />
        <Callout title="Check your spam folder too">Links expire in 24 hours.</Callout>
        <Button type="submit" loading={busy} icon={<Send size={18} />}>Send reset link</Button>
      </form>
      <p className="foot">Remembered it? <Link to="/login">Sign in</Link></p>
    </>
  );
}