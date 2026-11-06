import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { PasswordField } from "../components/ui/Field";
import StrengthMeter from "../components/ui/StrengthMeter";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";

export default function ChangePassword() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ cur: "", pw: "", again: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.cur) return setErr("Enter your current password");
    if (f.pw.length < 8) return setErr("Use at least 8 characters for the new password");
    if (f.pw === f.cur) return setErr("New password must be different from the current one");
    if (f.pw !== f.again) return setErr("Passwords don't match");
    setBusy(true);
    try {
      await api.changePassword(f.cur, f.pw);
      setDone(true);
    } catch (x) {
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  const again = async () => {
    await signOut();
    nav("/login", { replace: true });
  };

  if (done)
    return (
      <div className="center">
        <StatusOrb kind="ok" />
        <h1>Password updated</h1>
        <p>For your security you've been signed out everywhere. Sign in again with your new password.</p>
        <Button onClick={again}>Sign in again</Button>
      </div>
    );

  return (
    <>
      <Badge icon={Lock} />
      <h1>Change your <span className="hl">password</span></h1>
      <p className="sub">Signed in as {user.email}. We'll sign you out everywhere after this, so you can sign in again.</p>
      <form className="form" onSubmit={submit} noValidate style={{ marginTop: 0 }}>
        {err && <Alert>{err}</Alert>}
        <PasswordField label="Current password" value={f.cur} onChange={set("cur")} autoComplete="current-password" placeholder="Your current password" autoFocus />
        <PasswordField label="New password" value={f.pw} onChange={set("pw")} autoComplete="new-password" placeholder="At least 8 characters" />
        <StrengthMeter pw={f.pw} />
        <PasswordField label="Confirm new password" value={f.again} onChange={set("again")} autoComplete="new-password" placeholder="Type it once more" />
        <Button type="submit" loading={busy} icon={<ShieldCheck size={18} />}>Save new password</Button>
      </form>
      <p className="foot"><Link to="/">Cancel</Link></p>
    </>
  );
}