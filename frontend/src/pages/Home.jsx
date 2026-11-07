import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, KeyRound, Search, ShieldCheck, User, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GlassCard from "../components/ui/GlassCard";

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Burning the midnight oil" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

function Ring({ value }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" role="img" aria-label={`Profile ${value}% complete`}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--field-edge)" strokeWidth="10" />
        <motion.circle
          cx="54" cy="54" r={r} fill="none" stroke="var(--a)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="num">{value}%</span>
      <small>profile</small>
    </div>
  );
}

function Tile({ to, icon: Icon, title, text, tint }) {
  const body = (
    <>
      <div className="bubble"><Icon size={22} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
    </>
  );
  return to ? (
    <GlassCard as={Link} to={to} className="tile" style={{ "--t": tint }}>{body}</GlassCard>
  ) : (
    <GlassCard className="tile lift" style={{ "--t": tint }}>{body}</GlassCard>
  );
}

export default function Home() {
  const { user } = useAuth();

  const checks = [
    { ok: user.isEmailVerified, t: "Email verified" },
    { ok: !!user.avatarUrl, t: "Add a profile photo" },
    { ok: !!user.bio?.trim(), t: "Write a short bio" },
  ];
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return (
    <>
      <GlassCard className="hero">
        <div>
          <h1>
            {greeting()}, {user.name.split(" ")[0]} 👋
            <span className={`role ${user.role}`}>{user.role}</span>
          </h1>
          <p>Communities, videos, assignments and chat are on their way. Until then, make your profile shine.</p>
          {pct < 100 && (
            <ul className="checklist">
              {checks.map((c) => (
                <li key={c.t} className={c.ok ? "done" : ""}>
                  <span className="tick">{c.ok && <Check size={12} strokeWidth={3} />}</span>{c.t}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Ring value={pct} />
      </GlassCard>

      <h2 className="section-title">Quick actions</h2>
      <div className="grid">
        <Tile to="/profile" icon={User} title="Your profile" text="Update your name, photo, username and bio." tint="var(--sky)" />
        <Tile to="/teachers" icon={Search} title="Find teachers" text="Search teachers by name, username or email." tint="var(--lilac)" />
        <Tile to="/change-password" icon={KeyRound} title="Change password" text="Keep your account safe. Takes ten seconds." tint="var(--rose)" />
        {user.role === "admin" && (
          <Tile to="/admin/teacher-requests" icon={ShieldCheck} title="Teacher requests" text="Approve or reject people who want to teach." tint="var(--mint)" />
        )}
      </div>

      <h2 className="section-title">Coming soon</h2>
      <div className="grid">
        {[
          ["Communities", "Classrooms and study groups.", "var(--coral)"],
          ["Videos", "Lectures from your teachers.", "var(--sun)"],
          ["Assignments", "Submit work, get graded.", "var(--mint)"],
          ["Chat", "Message classmates and teachers.", "var(--sky)"],
        ].map(([t, p, c]) => (
          <GlassCard key={t} className="tile soon" style={{ "--t": c }}>
            <div className="bubble"><Users size={22} /></div>
            <h3>{t}</h3>
            <p>{p}</p>
            <span className="tag">Soon</span>
          </GlassCard>
        ))}
      </div>
    </>
  );
}
