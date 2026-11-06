import { motion } from "framer-motion";
import { strength } from "../../utils/validate";

const cols = ["var(--coral)", "var(--yel)", "var(--sky)", "var(--mint)"];

export default function StrengthMeter({ pw }) {
  if (!pw) return null;
  const { score, hint } = strength(pw);
  return (
    <div className="meter" aria-live="polite">
      <div className="bars">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="bar">
            <motion.i initial={false} animate={{ scaleX: i < score ? 1 : 0 }} style={{ background: cols[score - 1] }} />
          </span>
        ))}
      </div>
      <small>{hint}</small>
    </div>
  );
}