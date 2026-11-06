import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

const spring = { stiffness: 220, damping: 22, mass: 0.5 };

export default function Glass({ tilt = 0, className = "", style, children, ...p }) {
  const ref = useRef(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [0, 100], [tilt, -tilt]), spring);
  const ry = useSpring(useTransform(mx, [0, 100], [-tilt, tilt]), spring);
  const hl = useMotionTemplate`radial-gradient(440px circle at ${mx}% ${my}%, var(--glh), transparent 55%)`;

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };
  const leave = () => {
    mx.set(50);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`glass ${className}`}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={move}
      onPointerLeave={leave}
      {...p}
    >
      <motion.i className="glass-hl" style={{ background: hl }} aria-hidden="true" />
      {children}
    </motion.div>
  );
}