import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api/auth";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => {}).finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (body) => {
    const d = await api.login(body);
    setUser(d.user);
    return d.user;
  }, []);

  const signInWithOAuth = useCallback(async (body) => {
    const d = await api.oauth(body);
    setUser(d.user);
    return d.user;
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, setUser, signIn, signInWithOAuth, signOut }),
    [user, ready, signIn, signInWithOAuth, signOut]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
