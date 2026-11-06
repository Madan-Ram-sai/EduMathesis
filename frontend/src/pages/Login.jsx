import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AtSign, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resendVerification } from "../api/auth";
import { msg } from "../api/http";
import { Field, PasswordField } from "../components/ui/Field";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import OAuthRow from "../components/ui/OAuthRow";
import { useStage } from "../components/auth/StageCtx";

export default function Login() {
  const { signIn } = useAuth();
  const { setShy } = useStage();
  const [f, setF] = useState({ id: "", password: "", remember: true });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErrs((s) => ({ ...s, [k]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setNote("");
    setUnverified(false);
    const id = f.id.trim();
    const v = {};
    if (!id) v.id = "Enter your email or username";
    if (!f.password) v.password = "Enter your password";
    setErrs(v);
    if (Object.keys(v).length) return;

    setBusy(true);
    try {
      await signIn({ ...(id.includes("@") ? { email: id } : { username: id }), password: f.password, remember: f.remember });
    } catch (x) {
      setUnverified(x.response?.status === 403);
      setErr(msg(x));
      setBusy(false);
    }
  };

  const resend = async () => {
    const id = f.id.trim();
    if (!id.includes("@")) return setErr("Type your email address above, then resend the link");
    try {
      await resendVerification(id);
      setErr("");
      setNote("A fresh verification link is on its way");
    } catch (x) {
      setErr(msg(x));
    }
  };

  return (
    <>
      <h1><span className="hl">Sign in</span></h1>
      <p className="sub">Welcome back.</p>
      <OAuthRow verb="Continue with" divider="OR CONTINUE WITH EMAIL" />

      <form className="form" onSubmit={submit} noValidate>
        {err && (
          <Alert>
            {err}
            {unverified && <> <button type="button" className="linkish" onClick={resend}>Resend verification email</button></>}
          </Alert>
        )}
        {note && <Alert kind="ok">{note}</Alert>}
        <Field label="Email or username" icon={AtSign} value={f.id} onChange={set("id")} error={errs.id} autoComplete="username" placeholder="you@college.edu" autoFocus />
        <PasswordField
          label="Password" value={f.password} onChange={set("password")} error={errs.password}
          autoComplete="current-password" placeholder="Your password"
          onFocus={() => setShy(true)} onBlur={() => setShy(false)}
        />
        <div className="row">
          <label className="remember">
            <input type="checkbox" checked={f.remember} onChange={(e) => setF((s) => ({ ...s, remember: e.target.checked }))} />
            <span className="box"><Check size={13} strokeWidth={3.4} /></span>
            Remember me
          </label>
          <Link to="/forgot-password" className="soft">Forgot password?</Link>
        </div>
        <Button type="submit" loading={busy} icon={<ArrowRight size={18} />}>{busy ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="foot">Don't have an account? <Link to="/register">Register</Link></p>
    </>
  );
}