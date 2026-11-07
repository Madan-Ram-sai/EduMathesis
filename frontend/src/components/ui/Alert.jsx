import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";

export default function Alert({ kind = "err", children }) {
  return (
    <motion.div
      className={`alert ${kind}`}
      role={kind === "err" ? "alert" : "status"}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {kind === "ok" ? <Check size={18} /> : <Info size={18} />}
      <div>{children}</div>
    </motion.div>
  );
}
