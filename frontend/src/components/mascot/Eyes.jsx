import { motion, useTransform } from "framer-motion";

const K = "#22304D";

export default function Eyes({ pts, r, pr, look, shy, fill = "#fff", pupil = K, stroke = K }) {
  const ox = useTransform(look.x, (v) => v * r * 0.4);
  const oy = useTransform(look.y, (v) => v * r * 0.4);
  return (
    <g>
      {pts.map(([cx, cy]) => (
        <g key={cx} className="blink">
          <motion.g initial={false} animate={{ opacity: shy ? 0 : 1 }} transition={{ duration: 0.15 }}>
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="3" />
            <motion.circle cx={cx} cy={cy} r={pr} fill={pupil} style={{ x: ox, y: oy }} />
          </motion.g>
          <motion.path
            d={`M${cx - r} ${cy}Q${cx} ${cy + r * 0.9} ${cx + r} ${cy}`}
            stroke={stroke}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: shy ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          />
        </g>
      ))}
    </g>
  );
}