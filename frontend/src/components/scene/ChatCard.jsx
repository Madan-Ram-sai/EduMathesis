import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileText, Hash, Send } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import Face from "./Face";
import { people } from "./people";

const SPAN = 392; // length of the arc the paper plane flies along
const ARC = `M0 44 Q${SPAN / 2} -16 ${SPAN} 44`;
const ARC_BACK = `M${SPAN} 44 Q${SPAN / 2} -16 0 44`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Plays one chat once: typing -> paper plane flies -> message lands -> reaction pops. */
function useChatRun(script) {
  const [s, set] = useState({ msgs: [], typing: null, flight: null });

  useEffect(() => {
    let dead = false;
    let n = 0;
    const up = (p) => set((v) => ({ ...v, ...p }));
    (async () => {
      await wait(600);
      for (const m of script.msgs) {
        if (dead) return;
        up({ typing: m.who });
        await wait(1000);
        if (dead) return;
        const id = ++n;
        up({ typing: null, flight: { id, from: m.who } });
        await wait(650);
        if (dead) return;
        set((v) => ({ ...v, msgs: [...v.msgs, { ...m, id }] }));
        await wait(700);
        if (dead) return;
        set((v) => ({ ...v, msgs: v.msgs.map((x) => (x.id === id ? { ...x, done: true } : x)) }));
        await wait(600);
      }
      if (!dead && script.endTyping) up({ typing: script.endTyping });
    })();
    return () => {
      dead = true;
    };
  }, [script]);

  return s;
}

const Bubble = forwardRef(function Bubble({ m, left }, ref) {
  const p = people[m.who];
  return (
    <motion.li
      ref={ref}
      layout
      className={`bub ${left ? "l" : "r"}`}
      initial={{ opacity: 0, y: 14, x: left ? -18 : 18, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <Face seed={p.seed} name={p.name} bg={p.bg} color={p.color} size={30} />
      <div className="b-body" style={{ "--c": p.color }}>
        <small>
          {p.name}
          {p.role === "teacher" && <em>Teacher</em>}
        </small>
        <p>{m.text}</p>
        {m.file && (
          <motion.span className="file" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <FileText size={14} />
            {m.file}
            <Download size={14} />
          </motion.span>
        )}
        <AnimatePresence>
          {m.done && m.react && (
            <motion.span
              className="react"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
            >
              {m.react}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
});

function Plane({ flight, dir }) {
  return (
    <motion.span
      key={flight.id}
      className="plane"
      initial={{ x: dir > 0 ? 0 : SPAN, y: 0, opacity: 0 }}
      animate={{ x: dir > 0 ? [0, SPAN / 2, SPAN] : [SPAN, SPAN / 2, 0], y: [0, -30, 0], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.9, ease: "easeInOut", opacity: { duration: 0.9, times: [0, 0.1, 0.85, 1] } }}
    >
      <span style={{ display: "block", transform: `scaleX(${dir})` }}>
        <motion.span
          style={{ display: "block" }}
          initial={{ rotate: -30 }}
          animate={{ rotate: [-30, 0, 30] }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <Send size={20} fill="var(--sun)" />
        </motion.span>
      </span>
    </motion.span>
  );
}

export default function ChatCard({ script }) {
  const { msgs, typing, flight } = useChatRun(script);
  const { cast, room } = script;
  const [a, b] = cast.map((id) => people[id]);
  const last = msgs[msgs.length - 1];
  const rcv = last && cast.find((c) => c !== last.who);
  const dir = flight && flight.from === cast[0] ? 1 : -1;

  return (
    <GlassCard className="chat">
      <header className="chat-h">
        <span className="room"><Hash size={16} /> {room}</span>
        <span className="online"><i className="live-dot" /> 12 online</span>
      </header>

      <div className="strip">
        {[
          [cast[0], a, "left"],
          [cast[1], b, "right"],
        ].map(([id, p, side]) => (
          <div key={id} className={`who ${side}`}>
            <div className="who-av">
              <Face seed={p.seed} name={p.name} bg={p.bg} color={p.color} size={48} />
              {rcv === id && (
                <motion.span
                  key={last.id}
                  className="pulse"
                  initial={{ scale: 0.8, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              )}
            </div>
            <small>{p.name}</small>
          </div>
        ))}
        <svg className="arc" viewBox={`0 0 ${SPAN} 60`} width={SPAN} height="60" aria-hidden="true">
          <path d={ARC} fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
          {flight && (
            <motion.path
              key={`d${flight.id}`}
              d={dir > 0 ? ARC : ARC_BACK}
              fill="none"
              stroke="var(--coral)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: [1, 1, 0] }}
              transition={{ pathLength: { duration: 0.85 }, opacity: { duration: 1.2, times: [0, 0.7, 1] } }}
            />
          )}
        </svg>
        {flight && <Plane flight={flight} dir={dir} />}
      </div>

      <ul className="msgs">
        <AnimatePresence initial={false} mode="popLayout">
          {msgs.slice(-3).map((m) => (
            <Bubble key={m.id} m={m} left={m.who === cast[0]} />
          ))}
        </AnimatePresence>
      </ul>

      <div className="typing-row">
        <AnimatePresence>
          {typing && (
            <motion.div
              key={typing}
              className={`typing ${typing === cast[0] ? "l" : "r"}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Face seed={people[typing].seed} name={people[typing].name} bg={people[typing].bg} color={people[typing].color} size={22} />
              <span className="dots"><i /><i /><i /></span>
              <small>{people[typing].name} is typing…</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="composer">
        <span>Message #{room}</span>
        <motion.span key={flight?.id} className="send" animate={flight ? { scale: [1, 1.3, 1], rotate: [0, -12, 0] } : {}}>
          <Send size={16} />
        </motion.span>
      </footer>
    </GlassCard>
  );
}
