import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AtSign, Mail, Sparkles, User } from "lucide-react";
import confetti from "canvas-confetti";
import * as api from "../api/auth";
import { msg } from "../api/http";
import { isEmail, isUsername } from "../utils/validate";
import { Field, PasswordField } from "../components/ui/Field";
import StrengthMeter from "../components/ui/StrengthMeter";
import AvatarPicker from "../components/ui/AvatarPicker";
import StatusOrb from "../components/ui/StatusOrb";
import OAuthButtons from "../components/ui/OAuthButtons";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useScene } from "../components/scene/SceneContext";

const slide = {
  in: (d) => ({ x: d * 40, opacity: 0 }),
  mid: { x: 0, opacity: 1 },
  out: (d) => ({ x: d * -40, opacity: 0 }),
};

function Sent({ email }) {
  const scene = useScene();
  const [wait, setWait] = useState(30);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 32,
      origin: { y: 0.3 },
      colors: ["#FF8A68", "#FFD166", "#8EDDC0", "#8CC5FF", "#C9B6FF"],
      disableForReducedMotion: true,
    });
    scene?.setMood("cheer"); // Prof. Pi celebrates
    const t = setTimeout(() => scene?.setMood("idle"), 2600);
    return () => {
      clearTimeout(t);
      scene?.setMood("idle");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setNote("Fresh link on its way ✉️");
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
      <Button variant="ghost" disabled={wait > 0} onClick={resend}>{wait ? `Resend in ${wait}s` : "Resend email"}</Button>
      <Link to="/login" className="soft">Back to login</Link>
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [f, setF] = useState({ name: "", email: "", password: "", username: "", bio: "" });
  const [avatar, setAvatar] = useState(null);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

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
    } else if (f.username && !isUsername(f.username)) {
      v.username = "3–20 letters, numbers or _";
    }
    setErrs(v);
    return !Object.keys(v).length;
  };

  const go = (d) => {
    if (d > 0 && !check()) return;
    setErr("");
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
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  if (done) return <Sent email={f.email.trim()} />;

  return (
    <>
      <div className="head">
        <h1>Start your <span className="hl">study circle</span></h1>
        <p>Join classmates and teachers in one place. It takes about a minute.</p>
      </div>

      <div className="stepper" aria-label={`Step ${step + 1} of 2`}>
        <span className="n on">1</span>
        <b>About you</b>
        <div className="bar"><i style={{ width: step === 0 ? "46%" : "100%" }} /></div>
        <span className={`n ${step === 1 ? "on" : ""}`}>2</span>
        <b className={step === 1 ? "" : "dim"}>Your space</b>
      </div>

      {step === 0 && <OAuthButtons onError={setErr} />}

      <form className="form" onSubmit={submit} noValidate>
        {err && <Alert>{err}</Alert>}
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {step === 0 ? (
            <motion.div key="s0" className="form" custom={dir} variants={slide} initial="in" animate="mid" exit="out" transition={{ duration: 0.22 }}>
              <Field label="Full name" icon={User} value={f.name} onChange={set("name")} error={errs.name} placeholder="Ada Lovelace" autoComplete="name" autoFocus />
              <Field label="Email" icon={Mail} type="email" value={f.email} onChange={set("email")} error={errs.email} placeholder="you@college.edu" autoComplete="email" />
              <PasswordField label="Password" value={f.password} onChange={set("password")} error={errs.password} placeholder="At least 8 characters" autoComplete="new-password" />
              <StrengthMeter pw={f.password} />
            </motion.div>
          ) : (
            <motion.div key="s1" className="form" custom={dir} variants={slide} initial="in" animate="mid" exit="out" transition={{ duration: 0.22 }}>
              <AvatarPicker file={avatar} onChange={setAvatar} onError={setErr} />
              <Field label="Username (optional)" icon={AtSign} value={f.username} onChange={set("username")} error={errs.username} placeholder="ada_codes" autoComplete="username" hint="We'll make one for you if you skip this." />
              <Field label="Short bio (optional)" as="textarea" rows={3} maxLength={160} value={f.bio} onChange={set("bio")} placeholder="CSE · loves graphs and chai" />
            </motion.div>
          )}
        </AnimatePresence>

        {step === 0 ? (
          <Button type="submit" icon={<ArrowRight size={18} />}>Continue</Button>
        ) : (
          <div className="btn-row">
            <Button type="button" variant="ghost" onClick={() => go(-1)} icon={<ArrowLeft size={18} />} aria-label="Back" />
            <Button type="submit" loading={busy} icon={<Sparkles size={18} />}>{busy ? "Creating…" : "Create my account"}</Button>
          </div>
        )}
      </form>

      <p className="foot">Already a member? <Link to="/login">Log in</Link></p>
    </>
  );
}
