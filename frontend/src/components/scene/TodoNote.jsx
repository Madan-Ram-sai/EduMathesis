import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { todo } from "./people";

/** Sticky note whose items tick themselves off one by one. */
export default function TodoNote() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v + 1) % (todo.length + 2)), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div className="note" style={{ rotate: -4 }} whileHover={{ rotate: 0, scale: 1.05 }}>
      <h4>Today ✨</h4>
      <ul>
        {todo.map((t, i) => (
          <li key={t} className={i < n ? "done" : ""}>
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <rect x="1.5" y="1.5" width="13" height="13" rx="4" fill="#fff" stroke="#22304D" strokeWidth="1.6" />
              {i < n && (
                <motion.path
                  d="M4 8.5l2.8 2.8L12 5"
                  fill="none"
                  stroke="#2E8F6B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </svg>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
