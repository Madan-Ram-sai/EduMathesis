import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import Logo from "../components/ui/Logo";

const Splash = () => (
  <div className="splash">
    <Logo />
  </div>
);

export function RequireAuth() {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Splash />;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} replace />;
}

export function GuestOnly() {
  const { user, ready } = useAuth();
  const { chosen } = usePrefs();
  const loc = useLocation();
  if (!ready) return <Splash />;
  if (!user) return <Outlet />;
  return <Navigate to={chosen ? loc.state?.from?.pathname || "/" : "/choose-teacher"} replace />;
}