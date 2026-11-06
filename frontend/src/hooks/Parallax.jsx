import { createContext, useContext, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const Ctx = createContext(null);
const spring = { stiffness: 70, damping: 20, mass: 0.6 };

export function ParallaxProvider({ children }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const k = { x: useSpring(mx, spring), y: useSpring(my, spring) };

  useEffect(() => {
    const on = (e) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my]);

  return <Ctx.Provider value={k}>{children}</Ctx.Provider>;
}

export function Layer({ depth = 10, className, style, children, ...p }) {
  const k = useContext(Ctx);
  const x = useTransform(k.x, (v) => v * depth);
  const y = useTransform(k.y, (v) => v * depth);
  return (
    <motion.div className={className} style={{ x, y, ...style }} {...p}>
      {children}
    </motion.div>
  );
}