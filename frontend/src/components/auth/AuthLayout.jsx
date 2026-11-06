import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import Shell from "../ui/Shell";
import Glass from "../ui/Glass";
import Stage from "../stage/Stage";
import { StageProvider } from "./StageCtx";

const routes = {
  "/login": { acc: "var(--coral)", stage: "lesson", side: "left" },
  "/register": { acc: "var(--mint)", stage: "steps", side: "right" },
  "/forgot-password": { acc: "var(--lilac)" },
  "/reset-password": { acc: "var(--mint)" },
  "/settings/change-password": { acc: "var(--rose)" },
  "/verify-email": { acc: "var(--sky)" },
};

export default function AuthLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const r = routes[pathname] || routes["/forgot-password"];

  return (
    <StageProvider>
      <Shell>
        <main className={`auth ${r.stage ? "has-stage" : "simple"}`} data-side={r.side} style={{ "--acc": r.acc }}>
          {r.stage && (
            <motion.aside layout="position" className="stage-col" transition={{ type: "spring", stiffness: 140, damping: 22 }}>
              <Stage variant={r.stage} />
            </motion.aside>
          )}
          <motion.section layout="position" className="card-col" transition={{ type: "spring", stiffness: 140, damping: 22 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                className="card-wrap"
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <i className="slab" />
                <Glass tilt={2} className="card">{outlet}</Glass>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </main>
      </Shell>
    </StageProvider>
  );
}