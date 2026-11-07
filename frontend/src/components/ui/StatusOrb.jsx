import { motion } from "framer-motion";
import { Check, Mail, X } from "lucide-react";

/** kind: "loading" | "ok" | "bad" | "sent" */
export default function StatusOrb({ kind }) {
  const Icon = { ok: Check, bad: X, sent: Mail }[kind];
  return (
    <motion.div
      key={kind}
      className={`orb ${kind}`}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
    >
      {kind === "loading" ? <span className="spin big" /> : <Icon size={34} strokeWidth={2.6} />}
    </motion.div>
  );
}
