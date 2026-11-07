import { useEffect, useState } from "react";
import ProfPi from "./ProfPi";
import SineGraph from "./SineGraph";

const lines = {
  register: {
    title: "Join in 3 steps",
    line: "var(--sun)",
    items: [
      { c: "#FF8A68", t: "Your details", done: true },
      { c: "#8CC5FF", t: "Profile photo" },
      { c: "#8EDDC0", t: "Verify your email" },
    ],
  },
  login: {
    title: "Welcome back!",
    line: "var(--sky)",
    items: [
      { c: "#FFD166", t: "Your communities", dot: true },
      { c: "#FF8A68", t: "Fresh videos", dot: true },
      { c: "#8EDDC0", t: "Quick answers", dot: true },
    ],
  },
};

const fmt = (s) => `0:${String(s).padStart(2, "0")} / 0:10`;

/**
 * The green board. Everything draws in one after another (see the --d delays in scene.css);
 * Scene.jsx waits for it to finish before showing the chat card.
 */
export default function Board({ variant = "register", mood }) {
  const cfg = lines[variant] || lines.register;
  const [sec, setSec] = useState(0);

  // the little video-player bar on the board loops on its own, whether or not the board is visible
  useEffect(() => {
    const id = setInterval(() => setSec((s) => (s + 1) % 11), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <svg className="board" viewBox="0 0 720 384" role="img" aria-label="A blackboard showing a sine graph, taught by Prof. Pi">
      <g className="anim pop" style={{ "--d": "0s" }}>
        <rect x="0" y="0" width="720" height="350" rx="28" className="b-frame" />
        <rect x="14" y="14" width="692" height="322" rx="16" className="b-surface" />
        <ellipse cx="400" cy="150" rx="250" ry="88" fill="#fff" fillOpacity=".05" />
        <rect x="0" y="346" width="720" height="30" rx="8" className="b-ledge" />
        <rect x="104" y="351" width="28" height="9" rx="4.5" fill="#FF8A68" />
        <rect x="142" y="351" width="28" height="9" rx="4.5" fill="#FFF7EC" />
      </g>

      {/* title + underline */}
      <text className="hand anim" style={{ "--d": ".5s" }} x="44" y="84" fontSize="62" fill="var(--chalk)">{cfg.title}</text>
      <path
        className="draw"
        pathLength="1"
        style={{ "--d": "1s" }}
        d="M44 100 q12 -9 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0"
        stroke={cfg.line}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* list */}
      {cfg.items.map((it, i) => {
        const y = 146 + i * 54;
        return (
          <g key={it.t} className="anim" style={{ "--d": `${1.3 + i * 0.25}s` }}>
            {it.dot ? (
              <circle cx="56" cy={y - 10} r="9" fill={it.c} />
            ) : (
              <>
                <circle cx="58" cy={y - 10} r="17" fill="none" stroke={it.c} strokeWidth="3" />
                <text x="58" y={y - 1} textAnchor="middle" className="hand" fontSize="28" fill={it.c}>{i + 1}</text>
              </>
            )}
            <text x={it.dot ? 80 : 90} y={y} className="hand" fontSize="42" fill="var(--chalk)">{it.t}</text>
            {it.done && (
              <path d="M266 130 l10 11 l22 -26" stroke="#8EDDC0" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        );
      })}

      <SineGraph x0={404} y0={198} w={170} amp={48} delay={1.9} />

      {/* Prof. Pi */}
      <g transform="translate(586,138) scale(.86)">
        <g className="anim pop-up" style={{ "--d": "2.6s" }}>
          <ProfPi mood={mood} />
        </g>
      </g>

      {/* player bar */}
      <g className="anim" style={{ "--d": ".8s" }}>
        <path d="M14 296 H706 V320 a16 16 0 0 1 -16 16 H30 a16 16 0 0 1 -16 -16 Z" className="b-bar" />
        <path d="M34 306 v20 l17 -10 Z" fill="#FFD166" />
        <rect x="68" y="314" width="440" height="5" rx="2.5" fill="#fff" fillOpacity=".25" />
        <rect x="68" y="314" width={sec * 44} height="5" rx="2.5" fill="#FFD166" style={{ transition: "width 1s linear" }} />
        <g fill="#fff">
          {[68, 178, 288, 398, 508].map((x) => <circle key={x} cx={x} cy="316.5" r="3.2" />)}
        </g>
        <text x="540" y="321" fontSize="12.5" fontWeight="800" fill="#fff" fontFamily="var(--f-ui)">{fmt(sec)}</text>
        <rect x="628" y="305" width="58" height="22" rx="11" fill="#FFD166" />
        <text x="657" y="320.5" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#22304D" fontFamily="var(--f-ui)">LIVE</text>
      </g>
    </svg>
  );
}
