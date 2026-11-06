import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Play } from "lucide-react";
import Glass from "../ui/Glass";
import { Layer } from "../../hooks/Parallax";
import { STUDENT } from "./ChatCard";

const todo = ["Finish DSA sheet", "Answer a doubt", "Submit lab report"];

function Note() {
  const [done, setDone] = useState([true, true, false]);
  return (
    <motion.div className="note" style={{ rotate: -3 }} whileHover={{ rotate: 0, scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
      <b>Today</b>
      {todo.map((t, i) => (
        <button key={t} type="button" className={`todo ${done[i] ? "done" : ""}`} aria-pressed={done[i]} onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}>
          <span className="cb">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <motion.path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#22352B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: done[i] ? 1 : 0 }} transition={{ duration: 0.25 }} />
            </svg>
          </span>
          <span className="t">{t}</span>
        </button>
      ))}
    </motion.div>
  );
}

const Dot = ({ c, t, m }) => <span className="av" style={{ background: c, width: 22, height: 22, fontSize: 10, marginLeft: m }}>{t}</span>;

function Chip({ teacher }) {
  return (
    <Glass className="chip" whileHover={{ scale: 1.03 }}>
      # cse-2026
      <span className="stack">
        <Dot c={STUDENT.color} t="M" m={0} />
        <Dot c={teacher.color} t={teacher.name.replace("Prof. ", "")[0]} m={-6} />
        <Dot c="var(--mint)" t="I" m={-6} />
      </span>
      <span className="muted">128 members</span>
    </Glass>
  );
}

const pop = { initial: { opacity: 0, y: 14, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.96 }, transition: { type: "spring", stiffness: 300, damping: 24 } };

function Info({ teacher }) {
  return (
    <Glass className="info" {...pop}>
      <span className="ic" style={{ background: "var(--yel)" }}><Play size={16} fill="#22352B" /></span>
      <div><b>{teacher.name} is teaching</b><small>Today's lesson · 48 watching</small></div>
      <span className="live-pill">LIVE</span>
    </Glass>
  );
}

function Toast({ toast }) {
  return (
    <Glass className="info" {...pop}>
      <motion.span className="ic" style={{ background: "var(--coral)" }} animate={{ rotate: [0, -20, 20, -14, 14, 0] }} transition={{ delay: 0.35, duration: 0.8 }}><Bell size={16} /></motion.span>
      <div><b>{toast.title}</b><small>{toast.sub}</small></div>
    </Glass>
  );
}

export default function Ambient({ s, teacher }) {
  return (
    <div className="ambient">
      <Layer depth={22}><Note /></Layer>
      <div className="amb-right">
        <Layer depth={14}><Chip teacher={teacher} /></Layer>
        <Layer depth={18}>
          <div className="info-slot">
            <AnimatePresence mode="wait">{s.toast ? <Toast key="t" toast={s.toast} /> : <Info key="i" teacher={teacher} />}</AnimatePresence>
          </div>
        </Layer>
      </div>
    </div>
  );
}