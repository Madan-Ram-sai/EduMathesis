import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Hash, Send } from "lucide-react";
import Glass from "../ui/Glass";

const ARC = "M0 34Q150 -20 300 34";
const BACK = "M300 34Q150 -20 0 34";

export const STUDENT = { name: "Meera", color: "var(--coral)", init: "M" };

const Av = ({ p, size = 28 }) => (
  <span className="av" style={{ background: p.color, width: size, height: size, fontSize: size * 0.42 }}>{p.init}</span>
);

const Bubble = forwardRef(function Bubble({ m, p, left }, ref) {
  return (
    <motion.li
      ref={ref} layout className={`bub ${left ? "l" : "r"}`}
      initial={{ opacity: 0, y: 14, x: left ? -18 : 18, scale: 0.92 }} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <Av p={p} />
      <div>
        {p.teacher && <small className="nm">{p.name} <em>Teacher</em></small>}
        <div className={`bb ${p.teacher ? "b2" : "b1"}`}>
          {m.text}
          {m.file && (
            <motion.span className="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <FileText size={13} />{m.file}<Download size={13} />
            </motion.span>
          )}
          <AnimatePresence>
            {m.react && (
              <motion.span className="react" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>{m.react}</motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
});

function Plane({ dir }) {
  return (
    <motion.span
      className="plane"
      initial={{ left: dir > 0 ? "0%" : "100%", y: 0, opacity: 0 }}
      animate={{ left: dir > 0 ? ["0%", "50%", "100%"] : ["100%", "50%", "0%"], y: [0, -27, 0], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.9, ease: "easeInOut", opacity: { duration: 0.9, times: [0, 0.1, 0.85, 1] } }}
    >
      <span style={{ display: "block", transform: `scaleX(${dir})` }}><Send size={20} fill="var(--yel)" /></span>
    </motion.span>
  );
}

export default function ChatCard({ s, teacher }) {
  const T = { name: teacher.name, color: teacher.color, init: teacher.name.replace("Prof. ", "")[0], teacher: true };
  const P = { s: STUDENT, t: T };
  const fl = s.flight;
  const dir = fl && fl.from === "t" ? -1 : 1;
  const last = s.msgs[s.msgs.length - 1];
  const rcv = last && (last.who === "s" ? "t" : "s");

  const Who = ({ id }) => (
    <div className="who">
      <div className="who-av">
        <Av p={P[id]} size={44} />
        {rcv === id && (
          <motion.i key={last.id} className="pulse" initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 0.8 }} />
        )}
      </div>
      <small>{P[id].name}</small>
    </div>
  );

  return (
    <Glass className="chat">
      <header className="chat-head">
        <span><Hash size={15} /> cse-study-room</span>
        <span className="online"><i className="dot" />12 online</span>
      </header>
      <div className="chat-strip">
        <Who id="s" />
        <div className="arc-wrap">
          <svg viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
            <path d={ARC} className="arc-base" />
            {fl && (
              <motion.path
                key={`d${fl.id}`} d={dir > 0 ? ARC : BACK} className="arc-fly"
                initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                transition={{ pathLength: { duration: 0.85 }, opacity: { duration: 1.2, times: [0, 0.7, 1] } }}
              />
            )}
          </svg>
          {fl && <Plane key={fl.id} dir={dir} />}
        </div>
        <Who id="t" />
      </div>
      <ul className="msgs">
        <AnimatePresence initial={false} mode="popLayout">
          {s.msgs.map((m) => <Bubble key={m.id} m={m} p={P[m.who]} left={m.who === "s"} />)}
        </AnimatePresence>
      </ul>
      <div className="typing-row">
        <AnimatePresence>
          {s.typing && (
            <motion.div key={s.typing} className="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Av p={P[s.typing]} size={20} />
              <span className="dots"><i /><i /><i /></span>
              {P[s.typing].name} is typing
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="composer">
        Message #cse-study-room
        <motion.span key={fl?.id} className="send" animate={fl ? { scale: [1, 1.3, 1], rotate: [0, -12, 0] } : {}}><Send size={14} /></motion.span>
      </div>
    </Glass>
  );
}