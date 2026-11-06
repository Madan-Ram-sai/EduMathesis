import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, GraduationCap, KeyRound, LogOut, Search, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";
import Blobs from "../ui/Blobs";
import Avatar from "../ui/Avatar";
import ThemeToggle from "../ui/ThemeToggle";

const pages = {
  "/": "home",
  "/profile": "profile",
  "/teachers": "forgot",
  "/change-password": "change",
  "/admin/teacher-requests": "reset",
};

export default function AppShell() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const menu = useRef(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const off = (e) => !menu.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const logout = async () => {
    await signOut();
    nav("/login", { replace: true });
  };

  return (
    <div className="page" data-page={pages[pathname] || "home"}>
      <Blobs />
      <header className="topbar glass">
        <Logo />
        <nav className="topnav" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/teachers"><Search size={15} /> Teachers</NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin/teacher-requests"><ShieldCheck size={15} /> Requests</NavLink>
          )}
        </nav>
        <div className="topright">
          <ThemeToggle />
          <div className="menu" ref={menu}>
            <button type="button" className="me-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
              <Avatar user={user} size={34} />
              <span className="me-name">{user.name.split(" ")[0]}</span>
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  className="dropdown glass"
                  role="menu"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="dd-head">
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                    <span className={`role ${user.role}`}>{user.role}</span>
                  </div>
                  <NavLink to="/profile" role="menuitem"><User size={16} /> Profile</NavLink>
                  <NavLink to="/change-password" role="menuitem"><KeyRound size={16} /> Change password</NavLink>
                  {user.role === "student" && <NavLink to="/" role="menuitem"><GraduationCap size={16} /> Become a teacher</NavLink>}
                  <button type="button" role="menuitem" onClick={logout}><LogOut size={16} /> Log out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <motion.main
        key={pathname}
        className="app-main"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
