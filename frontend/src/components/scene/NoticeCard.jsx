import { AnimatePresence, motion } from "framer-motion";
import { Bell, Play } from "lucide-react";
import GlassCard from "../ui/GlassCard";

/** Small notification card. It changes with whichever scene is playing. */
export default function NoticeCard({ notice }) {
  return (
    <div className="notice-slot">
      <AnimatePresence mode="wait">
        {notice && (
          <motion.div
            key={notice.key}
            initial={{ x: 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <GlassCard className="notice">
              <motion.span className="n-ico" animate={notice.bell ? { rotate: [0, -20, 20, -14, 14, 0] } : {}} transition={{ delay: 0.35, duration: 0.8 }}>
                {notice.bell ? <Bell size={18} /> : <Play size={16} fill="currentColor" />}
              </motion.span>
              <div>
                <b>{notice.title}</b>
                <small>{notice.sub}</small>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
