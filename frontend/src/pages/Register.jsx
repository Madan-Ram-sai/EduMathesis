import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AtSign, Check, Mail, Sparkles, User } from "lucide-react";
import confetti from "canvas-confetti";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { isEmail } from "../utils/validate";
import { Field, PasswordField } from "../components/ui/Field";
import StrengthMeter from "../components/ui/StrengthMeter";
import AvatarPicker from "../components/ui/AvatarPicker";
import StatusOrb from "../components/ui/StatusOrb";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import OAuthRow from "../components/ui/OAuthRow";
import { useStage } from "../components/auth/StageCtx";

const slide = {
  in: (d) => ({ x: d * 40, opacity: 0 }),
  mid: { x: 0, opacity: 1 },
  out: (d) => ({ x: d * -40, opacity: 0 }),
};

function Sent({ email }) {
  const [wait, setWait] = useState(30);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    confetti({
      particleCount: 90, spread: 75, startVelocity: 32, origin: { y: 0.3 },
      colors: ["#F08A70", "#F2C94C", "#8DD5B4", "#7DB7E3", "#C9B6FF"], disableForReducedMotion: true,
    });
  }, []);
  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const resend = async () => {
    try {
      await api.resendVerification(email);
      setErr("");
      setNote("Fresh link on its way");
      setWait(30);
    } catch (x) {
      setErr(msg(x));
    }
  };

  return (
    <div className="center">
      <StatusOrb kind="sent" />
      <h1>Check your inbox</h1>
      <p>We sent a verification link to <b>{email}</b>. Open it to activate your account.</p>
      {note && <Alert kind="ok">{note}</Alert>}
      {err && <Alert>{err}</Alert>}
      <Button tone="ghost" disabled={wait > 0} onClick={resend}>{wait ? `Resend in ${wait}s` : "Resend email"}</Button>
      <Link to="/login" className="soft">Back to sign in</Link>
    </div>
  );
}

export default function Register() {
  const { setReg } = useStage();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({ name: "", email: "", password: "", username: "", bio: "" });
  const [avatar, setAvatar] = useState(null);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setReg(done ? 2 : step);
    return () => setReg(0);
  }, [step, done, setReg]);

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErrs((s) => ({ ...s, [k]: "" }));
  };

  const check = () => {
    const v = {};
    if (step === 0) {
      if (f.name.trim().length < 2) v.name = "Tell us your name";
      if (!isEmail(f.email.trim())) v.email = "That email doesn't look right";
      if (f.password.length < 8) v.password = "Use at least 8 characters";
    } else if (f.username && !/^[a-zA-Z0-9_]{3,20}$/.test(f.username)) {
      v.username = "3–20 letters, numbers or _";
    }
    setErrs(v);
    return !Object.keys(v).length;
  };

  const go = (d) => {
    if (d > 0 && !check()) return;
    setDir(d);
    setStep((s) => s + d);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step === 0) return go(1);
    if (!check()) return;

    const fd = new FormData();
    fd.append("name", f.name.trim());
    fd.append("email", f.email.trim());
    fd.append("password", f.password);
    if (f.username.trim()) fd.append("username", f.username.trim());
    if (f.bio.trim()) fd.append("bio", f.bio.trim());
    if (avatar) fd.append("avatar", avatar);

    setBusy(true);
    setErr("");
    try {
      await api.register(fd);
      setDone(true);
    } catch (x) {
      const m = msg(x);
      if (x.response?.status === 409 && /email/i.test(m)) {
        setDir(-1);
        setStep(0);
        setErrs({ email: m });
      } else setErr(m);
    } finally {
      setBusy(false);
    }
  };

  if (done) return <Sent email={f.email.trim()} />;

  return (
    <>
      <h1><span className="hl">Register</span></h1>
      <p className="sub">Join classmates and teachers in one place.</p>
      <OAuthRow verb="Sign up with" divider="OR REGISTER WITH EMAIL" />

      <div className="steps" aria-label="Progress">
        <span className="step on"><span>{step > 0 ? <Check size={12} /> : 1}</span>Details</span>
        <div className="steps-line"><motion.i initial={false} animate={{ scaleX: step }} /></div>
        <span className={`step ${step ? "on" : ""}`}><span>2</span>Profile</span>
      </div>

      <form className="form" onSubmit={submit} noValidate>
        {err && <Alert>{err}</Alert>}
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} className="pane" variants={slide} custom={dir} initial="in" animate="mid" exit="out" transition={{ duration: 0.2 }}>
            {step === 0 ? (
              <>
                <Field label="Full name" icon={User} value={f.name} onChange={set("name")} error={errs.name} autoComplete="name" placeholder="Your name" autoFocus />
                <Field label="Email" icon={Mail} type="email" value={f.email} onChange={set("email")} error={errs.email} autoComplete="email" placeholder="you@college.edu" />
                <PasswordField label="Password" value={f.password} onChange={set("password")} error={errs.password} autoComplete="new-password" placeholder="At least 8 characters" />
                <StrengthMeter pw={f.password} />
              </>
            ) : (
              <>
                <AvatarPicker file={avatar} onChange={setAvatar} onError={(m) => setErrs((s) => ({ ...s, avatar: m }))} />
                {errs.avatar && <p className="err">{errs.avatar}</p>}
                <Field label="Username (optional)" icon={AtSign} value={f.username} onChange={set("username")} error={errs.username} autoComplete="username" placeholder="your_username" />
                <Field label="Short bio (optional)" as="textarea" rows={3} maxLength={160} value={f.bio} onChange={set("bio")} placeholder="CSE sophomore. Loves graphs and chai." />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="actions">
          {step > 0 && <Button tone="ghost" onClick={() => go(-1)} icon={<ArrowLeft size={18} />} aria-label="Back" />}
          <Button type="submit" loading={busy} icon={step ? <Sparkles size={18} /> : <ArrowRight size={18} />}>
            {step ? (busy ? "Creating…" : "Register") : "Continue"}
          </Button>
        </div>
      </form>
      <p className="foot">Already have an account? <Link to="/login">Sign in</Link></p>
    </>
  );
}