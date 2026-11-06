import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, KeyRound } from "lucide-react";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { PasswordField } from "../components/ui/Field";
import StrengthMeter from "../components/ui/StrengthMeter";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";

export default function ResetPassword() {
  const [q] = useSearchParams();
  const nav = useNavigate();
  const token = q.get("token");
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [err, setErr] = useState(token ? "" : "This reset link is missing its token.");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setErr("Use at least 8 characters");
    if (pw !== again) return setErr("Passwords don't match");
    setBusy(true);
    setErr("");
    try {
      await api.resetPassword(token, pw);
      setDone(true);
    } catch (x) {
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="center">
        <StatusOrb kind="ok" />
        <h1>Password updated</h1>
        <p>You're all set. Sign in with your new password.</p>
        <Button onClick={() => nav("/login")}>Go to sign in</Button>
      </div>
    );

  return (
    <>
      <Badge icon={KeyRound} />
      <h1>Choose a <span className="hl">new password</span></h1>
      <p className="sub">Make it memorable for you, hard for everyone else.</p>
      <form className="form" onSubmit={submit} noValidate style={{ marginTop: 0 }}>
        {err && <Alert>{err}</Alert>}
        <PasswordField label="New password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} autoComplete="new-password" placeholder="At least 8 characters" autoFocus />
        <StrengthMeter pw={pw} />
        <PasswordField label="Confirm password" value={again} onChange={(e) => { setAgain(e.target.value); setErr(""); }} autoComplete="new-password" placeholder="Type it once more" />
        <Button type="submit" loading={busy} disabled={!token} icon={<ArrowRight size={18} />}>Update password</Button>
      </form>
      <p className="foot">Back to <Link to="/login">Sign in</Link></p>
    </>
  );
}