import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
export const usePrefs = () => useContext(Ctx);

const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };

export function PrefsProvider({ children }) {
  const [theme, setTheme] = useState(() => get("edu:theme") || "system");
  const [picked, setPicked] = useState(() => get("edu:mascot"));
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const d = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.dataset.theme = d ? "dark" : "light";
      setDark(d);
    };
    apply();
    put("edu:theme", theme);
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [theme]);

  const setMascot = (id) => { put("edu:mascot", id); setPicked(id); };

  return (
    <Ctx.Provider value={{ theme, setTheme, dark, mascot: picked || "pi", chosen: !!picked, setMascot }}>
      {children}
    </Ctx.Provider>
  );
}