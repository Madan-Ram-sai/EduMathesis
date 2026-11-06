import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePrefs } from "../context/PrefsContext";
import Shell from "../components/ui/Shell";
import Glass from "../components/ui/Glass";
import Button from "../components/ui/Button";
import Mascot from "../components/mascot/Mascot";
import { CHARACTERS } from "../components/mascot/characters";

export default function Home() {
  const { user, signOut } = useAuth();
  const { mascot } = usePrefs();
  return (
    <Shell right={<Button tone="ghost" onClick={signOut} icon={<LogOut size={18} />}>Log out</Button>}>
      <main className="home" style={{ "--acc": "var(--mint)" }}>
        <motion.div className="card-wrap" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
          <i className="slab" />
          <Glass tilt={3} className="card home-card">
            <div className="home-art"><Mascot id={mascot} /></div>
            <h1>Hi, {user.name.split(" ")[0]}</h1>
            <p className="sub">You're signed in as <b>{user.role}</b>. {CHARACTERS[mascot].name} is your teacher. Communities, videos and assignments land here next.</p>
            <div className="row" style={{ gap: 18 }}><Link to="/choose-teacher" className="soft">Change teacher</Link><Link to="/settings/change-password" className="soft">Change password</Link></div>
          </Glass>
        </motion.div>
      </main>
    </Shell>
  );
}