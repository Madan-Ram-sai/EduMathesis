import { motion } from "framer-motion";

/** variant: "primary" (accent) | "ghost" | "glass" | "danger". Accent colour comes from the page. */
export default function Button({ variant = "primary", loading, icon, children, className = "", tone, ...p }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`btn ${variant} ${className}`}
      {...p}
      disabled={loading || p.disabled}
    >
      {loading && <span className="spin" aria-hidden="true" />}
      {children}
      {!loading && icon}
    </motion.button>
  );
}
