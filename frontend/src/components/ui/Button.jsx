import { motion, useMotionValue, useSpring } from "framer-motion";
import { Loader2 } from "lucide-react";

const spring = { stiffness: 300, damping: 22 };

export default function Button({ children, loading, tone, icon, ...p }) {
  const off = loading || p.disabled;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  const move = (e) => {
    if (off) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.1);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.22);
  };
  const leave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      type="button"
      {...p}
      disabled={off}
      className={`btn ${tone === "ghost" ? "btn-ghost" : ""}`}
      style={{ x, y }}
      whileTap={off ? undefined : { scale: 0.97 }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {loading && <Loader2 size={18} className="spin" />}
      {children}
      {!loading && icon}
    </motion.button>
  );
}