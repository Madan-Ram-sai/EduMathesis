import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth";
import { msg } from "../api/http";
import GlassCard from "../components/ui/GlassCard";
import Bubble from "../components/ui/Bubble";
import { PasswordField } from "../components/ui/Field";
import StrengthMeter from "../components/ui/StrengthMeter";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function ChangePassword() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ cur: "", next: "", again: "" });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErrs((s) => ({ ...s, [k]: "" }));
    setErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.cur) v.cur = "Enter your current password";
    if (f.next.length < 8) v.next = "Use at least 8 characters";
    else if (f.next === f.cur) v.next = "Pick something different from your current password";
    if (f.again !== f.next) v.again = "Passwords don't match";
    setErrs(v);
    if (Object.keys(v).length) return;

    setBusy(true);
    setErr("");
    try {
      await changePassword(f.cur, f.next);
      // the backend revokes every session, so sign in again with the new password
      await signOut();
      nav("/login", { replace: true, state: { notice: "Password changed. Please log in again." } });
    } catch (x) {
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard as="form" className="panel narrow" onSubmit={submit} noValidate>
      <Bubble icon={Lock} />
      <h1>Change your <span className="hl">password</span></h1>
      <p className="sub">Signed in as {user.email}. We'll sign you out everywhere after this.</p>
      <div className="form">
        {err && <Alert>{err}</Alert>}
        <PasswordField label="Current password" value={f.cur} onChange={set("cur")} error={errs.cur} autoComplete="current-password" />
        <PasswordField label="New password" value={f.next} onChange={set("next")} error={errs.next} autoComplete="new-password" placeholder="At least 8 characters" />
        <StrengthMeter pw={f.next} />
        <PasswordField label="Confirm new password" value={f.again} onChange={set("again")} error={errs.again} autoComplete="new-password" placeholder="Type it once more" />
        <Button type="submit" loading={busy} icon={<ShieldCheck size={18} />}>Save new password</Button>
      </div>
    </GlassCard>
  );
}
