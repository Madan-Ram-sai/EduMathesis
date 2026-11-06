import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "edu-theme";
const Ctx = createContext({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(Ctx);

const readPref = () => {
  try {
    return localStorage.getItem(KEY) || "system";
  } catch {
    return "system";
  }
};

/** pref: "light" | "dark" | "system". `theme` is what's actually applied. */
export function ThemeProvider({ children }) {
  const [pref, setPref] = useState(readPref);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const t = pref === "system" ? (mq.matches ? "dark" : "light") : pref;
      setTheme(t);
      document.documentElement.dataset.theme = t;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [pref]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setPref(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage blocked: the choice just won't be remembered */
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
