import { motion } from "framer-motion";

export default function Badge({ icon: Icon }) {
  return (
    <motion.div
      className="simple-badge"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: [0, -14, 12, -6, 0] }}
      transition={{ scale: { type: "spring", stiffness: 300, damping: 14 }, rotate: { delay: 0.35, duration: 0.8 } }}
    >
      <Icon size={26} />
    </motion.div>
  );
}