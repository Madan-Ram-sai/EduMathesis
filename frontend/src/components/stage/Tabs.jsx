import { motion } from "framer-motion";
import { BookOpen, MessageSquare } from "lucide-react";
import Glass from "../ui/Glass";

const tabs = [["lesson", "Lesson", BookOpen], ["chat", "Chat", MessageSquare]];

export default function Tabs({ mode, sec, p, onJump }) {
  return (
    <>
      <Glass className="tabs" role="tablist" aria-label="Classroom view">
        {tabs.map(([id, label, Icon]) => {
          const on = mode === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={on} className="tab" onClick={() => onJump(id)}>
              {on && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="tab-in">
                <Icon size={16} />
                {label}
                <small>{on ? `0:0${Math.min(sec, 9)} / 0:10` : mode === "lesson" ? "next" : "done"}</small>
              </span>
              {on && <motion.i className="tab-bar" style={{ scaleX: p }} />}
            </button>
          );
        })}
      </Glass>
      <p className="tabs-hint">Plays one after the other. Click a tab to jump.</p>
    </>
  );
}