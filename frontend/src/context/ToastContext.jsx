import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info } from "lucide-react";

const Ctx = createContext({ ok: () => {}, err: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const id = useRef(0);

  const push = useCallback((kind, text) => {
    const key = ++id.current;
    setItems((s) => [...s.slice(-2), { key, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.key !== key)), 3800);
  }, []);

  const value = useMemo(() => ({ ok: (t) => push("ok", t), err: (t) => push("err", t) }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.key}
              layout
              className={`toast glass ${t.kind}`}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
            >
              <span className="toast-ico">{t.kind === "ok" ? <Check size={16} /> : <Info size={16} />}</span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
