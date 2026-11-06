import { createContext, useContext, useMemo, useState } from "react";

/** Lets form fields tell Prof. Pi how to react: "idle" | "hide" (covers eyes) | "cheer". */
const Ctx = createContext(null);
export const useScene = () => useContext(Ctx);

export function SceneProvider({ children }) {
  const [mood, setMood] = useState("idle");
  const value = useMemo(() => ({ mood, setMood }), [mood]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
