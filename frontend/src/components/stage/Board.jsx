import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import Mascot from "../mascot/Mascot";
import { usePrefs } from "../../context/PrefsContext";
import { useStage } from "../auth/StageCtx";

const W = 776, H = 304, X0 = 90, Y0 = 176, A = 70, PX = 100;
const XMAX = X0 + 4 * PX;
const f = (x) => Y0 - A * Math.sin(((x - X0) / PX) * Math.PI);
const clamp = (x) => Math.min(XMAX, Math.max(X0, x));
const CURVE = (() => {
  let d = "";
  for (let x = X0; x <= XMAX; x += 2) d += `${d ? "L" : "M"}${x} ${f(x).toFixed(1)}`;
  return d;
})();
const hand = { fontFamily: "Caveat, cursive" };
const chalk = "var(--chalk)";

function Player({ p, sec }) {
  return (
    <div className="player">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 1l11 6-11 6z" fill="var(--yel)" /></svg>
      <div className="track">
        <motion.i className="fill" style={{ scaleX: p }} />
        {[0, 25, 50, 75, 100].map((t) => <i key={t} className="tick" style={{ left: `${t}%` }} />)}
      </div>
      <span>0:0{Math.min(sec, 9)} / 0:10</span>
      <span className="live-pill">LIVE</span>
    </div>
  );
}

function Title({ text, w }) {
  return (
    <>
      <clipPath id="tclip">
        <motion.rect x="40" y="0" height="80" initial={{ width: 0 }} animate={{ width: w }} transition={{ duration: 1.3, delay: 0.3, ease: "easeOut" }} />
      </clipPath>
      <text x="48" y="56" fontSize="46" fill={chalk} clipPath="url(#tclip)" style={hand}>{text}</text>
      <motion.path
        d="M48 68q18 -10 36 0t36 0t36 0t36 0t36 0"
        stroke="var(--yel)" strokeWidth="4" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.5 }}
      />
    </>
  );
}

export function SineBoard({ p, sec }) {
  const { mascot } = usePrefs();
  const svg = useRef(null);
  const drag = useRef(false);
  const tgt = useRef(X0 + PX / 2);
  const [touched, setTouched] = useState(false);
  const sx = useSpring(X0 + PX / 2, { stiffness: 380, damping: 32 });
  const [vx, setVx] = useState(X0 + PX / 2);
  useMotionValueEvent(sx, "change", setVx);

  const prog = useMotionValue(0);
  useEffect(() => {
    const c = animate(prog, 1, { duration: 4, delay: 3.1, ease: "easeInOut" });
    return () => c.stop();
  }, [prog]);
  const tipX = useTransform(prog, (v) => X0 + 4 * PX * v);
  const tipY = useTransform(tipX, f);
  const tipO = useTransform(prog, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);

  const toSvg = (e) => {
    const s = svg.current;
    const pt = s.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(s.getScreenCTM().inverse());
  };
  const go = (x) => {
    tgt.current = clamp(x);
    sx.set(tgt.current);
  };
  const down = (e) => {
    drag.current = true;
    e.target.setPointerCapture?.(e.pointerId);
    setTouched(true);
    go(toSvg(e).x);
  };
  const move = (e) => drag.current && go(toSvg(e).x);
  const up = () => { drag.current = false; };
  const key = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setTouched(true);
    go(tgt.current + (e.key === "ArrowRight" ? 12 : -12));
  };

  const xr = (vx - X0) / PX;
  const val = Math.sin(xr * Math.PI);
  const py = f(vx);
  const right = vx < 300;
  const tx = right ? vx + 20 : vx - 190;

  return (
    <div className="board">
      <div className="board-in">
        <svg ref={svg} className="board-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <Title text="Today's lesson" w={240} />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.13 }} transition={{ delay: 2.2 }} stroke={chalk}>
            <path d="M190 84V272M290 84V272M390 84V272M490 84V272M70 106H540M70 246H540" />
          </motion.g>
          <g stroke={chalk} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M62 176H540" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 0.8 }} />
            <motion.path d="M90 276V82" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.2, duration: 0.7 }} />
            <motion.path d="M525 168l15 8-15 8M82 96l8-14 8 14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }} />
          </g>
          {["π", "2π", "3π", "4π"].map((t, i) => (
            <motion.text key={t} x={190 + i * 100} y={202} textAnchor="middle" fontSize="22" fill={chalk} style={hand} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 + i * 0.15 }}>{t}</motion.text>
          ))}
          <motion.path d={CURVE} fill="none" stroke="var(--coral)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3.1, duration: 4, ease: "easeInOut" }} />
          <motion.circle r="6" fill={chalk} cx={tipX} cy={tipY} style={{ opacity: tipO }} />
          <motion.text x="410" y="62" fontSize="38" fill={chalk} style={hand} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 7 }}>
            f(x) = <tspan fill="var(--mint)">sin x</tspan>
          </motion.text>

          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 7.4 }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <rect x={X0 - 10} y="70" width={4 * PX + 20} height="226" fill="transparent" style={{ cursor: "crosshair", touchAction: "none" }} onPointerDown={down} />
            <path d={`M${vx} ${py}V${Y0}M${vx} ${py}H${X0}`} stroke="var(--yel)" strokeWidth="2" strokeDasharray="4 5" pointerEvents="none" />
            <circle
              cx={vx} cy={py} r="11" fill="var(--yel)" stroke={chalk} strokeWidth="3" tabIndex={0}
              role="slider" aria-label="Move along the sine curve" aria-valuemin={0} aria-valuemax={4} aria-valuenow={Number(xr.toFixed(2))}
              style={{ cursor: "grab", touchAction: "none", outline: "none" }} onPointerDown={down} onKeyDown={key}
            />
            <g pointerEvents="none">
              <rect x={tx} y={py - 36} width="170" height="28" rx="14" fill={chalk} />
              <text x={tx + 85} y={py - 17} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--board2)" fontFamily="Nunito, sans-serif">
                x = {xr.toFixed(2)}π · sin x = {val.toFixed(2)}
              </text>
            </g>
            {!touched && (
              <motion.text x={X0 + 66} y="140" fontSize="26" fill="var(--yel)" style={hand} pointerEvents="none" animate={{ x: [0, 6, 0] }} transition={{ delay: 8, duration: 1.2, repeat: Infinity }}>
                drag me
              </motion.text>
            )}
          </motion.g>
        </svg>
        <div className="mascot-slot"><Mascot id={mascot} /></div>
        <Player p={p} sec={sec} />
      </div>
      <i className="tray" />
    </div>
  );
}

const steps = ["Your details", "Profile photo", "Verify your email"];
const cols = ["var(--coral)", "var(--sky)", "var(--mint)"];

export function StepsBoard({ p, sec }) {
  const { mascot } = usePrefs();
  const { reg } = useStage();
  return (
    <div className="board">
      <div className="board-in">
        <svg className="board-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <Title text="Join in 3 steps" w={260} />
          {steps.map((t, i) => (
            <g key={t} transform={`translate(70 ${130 + i * 58})`}>
              <motion.circle cx="0" cy="-12" r="18" stroke={cols[i]} strokeWidth="3.5" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 + i * 0.5, type: "spring" }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              <text x="0" y="-2" textAnchor="middle" fontSize="26" fill={cols[i]} style={hand}>{i + 1}</text>
              <motion.text x="38" y="0" fontSize="40" fill={chalk} style={hand} initial={{ opacity: 0, x: -12 }} animate={{ opacity: reg > i ? 0.6 : 1, x: 0 }} transition={{ delay: 1.9 + i * 0.5 }}>{t}</motion.text>
              <motion.path d="M290 -16l12 14 26-32" stroke="var(--mint)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: reg > i ? 1 : 0, opacity: reg > i ? 1 : 0 }} transition={{ duration: 0.4 }} />
              <motion.path d="M38 8q18 -8 36 0t36 0t36 0t36 0" stroke={cols[i]} strokeWidth="3.5" fill="none" strokeLinecap="round" initial={false} animate={{ pathLength: reg === i ? 1 : 0 }} transition={{ duration: 0.5 }} />
            </g>
          ))}
        </svg>
        <div className="mascot-slot"><Mascot id={mascot} /></div>
        <Player p={p} sec={sec} />
      </div>
      <i className="tray" />
    </div>
  );
}