import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const loc = useLocation();
  if (!ready) return <Splash />;
  return user ? <Navigate to={loc.state?.from?.pathname || "/"} replace /> : <Outlet />;
}

/** Use inside RequireAuth. Non-matching roles are sent home. */
export function RequireRole({ roles }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/" replace />;
}
