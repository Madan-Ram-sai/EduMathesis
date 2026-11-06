import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Alert({ kind = "error", children }) {
  const Icon = kind === "error" ? AlertTriangle : CheckCircle2;
  return (
    <motion.div
      className={`alert alert-${kind}`}
      role={kind === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0, x: kind === "error" ? [0, -6, 6, -4, 4, 0] : 0 }}
    >
      <Icon size={18} />
      <div>{children}</div>
    </motion.div>
  );
}