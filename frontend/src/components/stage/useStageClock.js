import { useCallback, useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";

export default function useStageClock(duration = 10) {
  const [mode, setMode] = useState("lesson");
  const [run, setRun] = useState(0);
  const [sec, setSec] = useState(0);
  const p = useMotionValue(0);

  useEffect(() => {
    let raf;
    let last = -1;
    const t0 = performance.now();
    p.set(0);
    setSec(0);
    const tick = (now) => {
      const el = (now - t0) / 1000;
      if (el >= duration) {
        setMode((m) => (m === "lesson" ? "chat" : "lesson"));
        setRun((r) => r + 1);
        return;
      }
      p.set(el / duration);
      const s = Math.floor(el);
      if (s !== last) {
        last = s;
        setSec(s);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, run, duration, p]);

  const jump = useCallback((m) => {
    setMode(m);
    setRun((r) => r + 1);
  }, []);

  return { mode, run, sec, p, jump };
}