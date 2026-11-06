import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CHARACTERS } from "./characters";
import { useStage } from "../auth/StageCtx";

const spring = { stiffness: 180, damping: 20 };

function useLook(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  useEffect(() => {
    const on = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 240);
      x.set((dx / d) * k);
      y.set((dy / d) * k);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [ref, x, y]);
  return { x: sx, y: sy };
}

export default function Mascot({ id, shy: shyProp, className = "" }) {
  const ref = useRef(null);
  const look = useLook(ref);
  const { shy: ctxShy } = useStage();
  const shy = shyProp ?? ctxShy;
  const ctl = useAnimationControls();
  const [say, setSay] = useState(false);
  const C = CHARACTERS[id] || CHARACTERS.pi;
  const rot = useTransform(look.x, (v) => v * 3);
  const lx = useTransform(look.x, (v) => v * 5);

  const hi = () => {
    ctl.start({ y: [0, -26, 0, -8, 0], scaleY: [1, 1.05, 0.95, 1.02, 1], transition: { duration: 0.7 } });
    setSay(true);
    setTimeout(() => setSay(false), 1400);
  };

  return (
    <motion.div ref={ref} className={`mascot ${className}`} style={{ rotate: rot, x: lx, transformOrigin: "50% 100%" }} onTap={hi}>
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div animate={ctl}>
          <svg viewBox="-50 10 260 240" role="img" aria-label={`${C.name}, your teacher`}>
            <C.Art look={look} shy={shy} />
          </svg>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {say && (
          <motion.span className="say" initial={{ opacity: 0, scale: 0.6, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
            Hi!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}