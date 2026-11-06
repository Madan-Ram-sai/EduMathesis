import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Shell from "../components/ui/Shell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Mascot from "../components/mascot/Mascot";
import { CHARACTERS, IDS } from "../components/mascot/characters";
import { usePrefs } from "../context/PrefsContext";

export default function ChooseTeacher() {
  const { mascot, setMascot } = usePrefs();
  const nav = useNavigate();
  const [sel, setSel] = useState(mascot);

  const go = (id) => {
    setMascot(id);
    nav("/", { replace: true });
  };

  return (
    <Shell>
      <main className="pick-page" style={{ "--acc": "var(--mint)" }}>
        <div className="pick-head">
          <h1><span className="hl">Choose your teacher</span></h1>
          <p className="sub">They'll show up on your board and in your chats. You can change this any time.</p>
        </div>
        <div className="pick-grid" role="radiogroup" aria-label="Teacher">
          {IDS.map((id, i) => {
            const C = CHARACTERS[id];
            const on = sel === id;
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 22 }}>
                <Glass tilt={6} className={`pick ${on ? "on" : ""}`} role="radio" aria-checked={on} tabIndex={0} onClick={() => setSel(id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(id))}>
                  {on && <motion.span className="pick-check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={16} strokeWidth={3} /></motion.span>}
                  <div className="pick-art"><Mascot id={id} shy={false} /></div>
                  <b>{C.name}</b>
                  <small>{C.tag}</small>
                </Glass>
              </motion.div>
            );
          })}
        </div>
        <div className="pick-actions">
          <Button tone="ghost" onClick={() => go("pi")}>Skip for now</Button>
          <Button onClick={() => go(sel)} icon={<ArrowRight size={18} />}>Continue with {CHARACTERS[sel].name}</Button>
        </div>
      </main>
    </Shell>
  );
}