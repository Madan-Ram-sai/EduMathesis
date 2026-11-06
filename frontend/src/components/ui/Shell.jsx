import { ParallaxProvider } from "../../hooks/Parallax";
import Backdrop from "./Backdrop";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function Shell({ right, children }) {
  return (
    <ParallaxProvider>
      <div className="shell">
        <Backdrop />
        <header className="topbar">
          <Logo />
          <div className="topbar-r">
            {right}
            <ThemeToggle />
          </div>
        </header>
        {children}
      </div>
    </ParallaxProvider>
  );
}