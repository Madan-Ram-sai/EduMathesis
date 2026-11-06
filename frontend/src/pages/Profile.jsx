import { useState } from "react";
import { AtSign, Save, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { updateProfile } from "../api/auth";
import { msg } from "../api/http";
import { fmtDate, isUsername } from "../utils/validate";
import GlassCard from "../components/ui/GlassCard";
import { Field } from "../components/ui/Field";
import AvatarPicker from "../components/ui/AvatarPicker";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name || "", username: user.username || "", bio: user.bio || "" });
  const [avatar, setAvatar] = useState(null);
  const [errs, setErrs] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
    setErrs((s) => ({ ...s, [k]: "" }));
  };

  const dirty =
    !!avatar || f.name.trim() !== (user.name || "") || f.username.trim() !== (user.username || "") || f.bio.trim() !== (user.bio || "");

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (f.name.trim().length < 2) v.name = "Tell us your name";
    if (f.username.trim() && !isUsername(f.username.trim())) v.username = "3–20 letters, numbers or _";
    setErrs(v);
    if (Object.keys(v).length) return;

    const fd = new FormData();
    fd.append("name", f.name.trim());
    if (f.username.trim() && f.username.trim() !== user.username) fd.append("newusername", f.username.trim());
    fd.append("bio", f.bio.trim());
    if (avatar) fd.append("avatar", avatar);

    setBusy(true);
    setErr("");
    try {
      const updated = await updateProfile(fd);
      setUser((u) => ({ ...u, ...updated }));
      setAvatar(null);
      toast.ok("Profile saved");
    } catch (x) {
      setErr(msg(x));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="two">
      <GlassCard as="form" className="panel" onSubmit={submit} noValidate>
        <h1>Your <span className="hl">profile</span></h1>
        <p className="sub">This is how classmates and teachers will see you.</p>
        <div className="form">
          {err && <Alert>{err}</Alert>}
          <AvatarPicker file={avatar} onChange={setAvatar} onError={setErr} current={user.avatarUrl} />
          <Field label="Full name" icon={User} value={f.name} onChange={set("name")} error={errs.name} autoComplete="name" />
          <Field label="Username" icon={AtSign} value={f.username} onChange={set("username")} error={errs.username} autoComplete="username" />
          <Field label="Bio" as="textarea" rows={4} maxLength={160} value={f.bio} onChange={set("bio")} placeholder="Tell people a little about you" hint={`${f.bio.length}/160`} />
          <Button type="submit" loading={busy} disabled={!dirty} icon={<Save size={18} />}>Save changes</Button>
        </div>
      </GlassCard>

      <GlassCard className="panel">
        <h2>Account</h2>
        <dl className="facts" style={{ marginTop: 16 }}>
          <div><dt>Email</dt><dd>{user.email}{user.isEmailVerified ? " ✓" : " (not verified)"}</dd></div>
          <div><dt>Role</dt><dd style={{ textTransform: "capitalize" }}>{user.role}</dd></div>
          <div><dt>Sign-in method</dt><dd style={{ textTransform: "capitalize" }}>{user.oauthProvider || "Email & password"}</dd></div>
          {user.createdAt && <div><dt>Member since</dt><dd>{fmtDate(user.createdAt)}</dd></div>}
        </dl>
      </GlassCard>
    </div>
  );
}
