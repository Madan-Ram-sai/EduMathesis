import { motion } from "framer-motion";
import { Check, KeyRound, Mail, MailCheck, X } from "lucide-react";

const map = {
  sent: [MailCheck, "--mint"],
  loading: [Mail, "--sky"],
  ok: [Check, "--mint"],
  bad: [X, "--rose"],
  key: [KeyRound, "--yel"],
};

export default function StatusOrb({ kind }) {
  const [Icon, c] = map[kind];
  return (
    <div className="orb" style={{ "--c": `var(${c})` }}>
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="ripple"
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, delay: i }}
        />
      ))}
      <motion.div
        key={kind}
        className="core"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <Icon size={34} />
      </motion.div>
    </div>
  );
}