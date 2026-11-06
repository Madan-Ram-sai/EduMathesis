import { createContext, useContext, useMemo, useState } from "react";

const Ctx = createContext({ shy: false, setShy: () => {}, reg: 0, setReg: () => {} });
export const useStage = () => useContext(Ctx);

export function StageProvider({ children }) {
  const [shy, setShy] = useState(false);
  const [reg, setReg] = useState(0);
  const v = useMemo(() => ({ shy, setShy, reg, setReg }), [shy, reg]);
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}