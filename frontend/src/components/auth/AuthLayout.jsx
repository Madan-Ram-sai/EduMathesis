import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import Logo from "../ui/Logo";
import Blobs from "../ui/Blobs";
import GlassCard from "../ui/GlassCard";
import ThemeToggle from "../ui/ThemeToggle";
import Scene from "../scene/Scene";
import { SceneProvider } from "../scene/SceneContext";

/** Each page gets its own colour combo (see [data-page] in index.css). `hero` pages also show the board + chat. */
const pageFor = (path) => {
  if (path.startsWith("/login")) return { page: "login", hero: true };
  if (path.startsWith("/register")) return { page: "register", hero: true };
  if (path.startsWith("/forgot-password")) return { page: "forgot" };
  if (path.startsWith("/reset-password") || path.startsWith("/verify-email")) return { page: "reset" };
  return { page: "login" }; // oauth callback
};

export default function AuthLayout() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const { page, hero } = pageFor(pathname);

  return (
    <SceneProvider>
      <div className="page" data-page={page}>
        <Blobs />
        <ThemeToggle className="theme-fab" />
        <main className={`auth ${hero ? "" : "simple"}`}>
          {hero && (
            <aside className="auth-scene">
              <Scene key={page} variant={page} />
            </aside>
          )}
          <GlassCard className="auth-card" glow={hero}>
            <Logo />
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </main>
      </div>
    </SceneProvider>
  );
}
