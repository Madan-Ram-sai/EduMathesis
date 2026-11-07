import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, AtSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resendVerification } from "../api/auth";
import { msg } from "../api/http";
import { Field, PasswordField } from "../components/ui/Field";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import OAuthButtons from "../components/ui/OAuthButtons";

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const next = loc.state?.from?.pathname || "/";
  const [f, setF] = useState({ id: "", password: "" });
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [note, setNote] = useState(loc.state?.notice || "");
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
      await signIn(id.includes("@") ? { email: id, password: f.password } : { username: id, password: f.password });
      nav(next, { replace: true });
    } catch (x) {
      setUnverified(x.response?.status === 403);
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    const id = f.id.trim();
    if (!id.includes("@")) return setErr("Type your email address above, then resend the link");
    try {
      await resendVerification(id);
      setErr("");
      setUnverified(false);
      setNote("A fresh verification link is on its way ✉️");
    } catch (x) {
      setErr(msg(x));
    }
  };

  return (
    <>
      <div className="head">
        <h1>Welcome <span className="hl">back</span></h1>
        <p>Your communities, videos and doubts are right where you left them.</p>
      </div>

      <OAuthButtons next={next} onError={setErr} />

      <form className="form" onSubmit={submit} noValidate>
        {err && (
          <Alert>
            {err}
            {unverified && (
              <> <button type="button" className="linkish" onClick={resend}>Resend verification email</button></>
            )}
          </Alert>
        )}
        {note && <Alert kind="ok">{note}</Alert>}

        <Field label="Email or username" icon={AtSign} value={f.id} onChange={set("id")} error={errs.id} autoComplete="username" placeholder="you@college.edu" autoFocus />
        <PasswordField label="Password" value={f.password} onChange={set("password")} error={errs.password} autoComplete="current-password" placeholder="Your password" />

        <div className="row">
          <span />
          <Link to="/forgot-password" className="soft">Forgot password?</Link>
        </div>

        <Button type="submit" loading={busy} icon={<ArrowRight size={18} />}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="foot">New here? <Link to="/register">Create your account</Link></p>
    </>
  );
}
