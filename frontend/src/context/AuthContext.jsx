import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/auth";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => {}).finally(() => setReady(true));
  }, []);

  const signIn = async (body) => {
    const d = await api.login(body);
    setUser(d.user);
    return d.user;
  };
  const signOut = async () => {
    await api.logout().catch(() => {});
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}