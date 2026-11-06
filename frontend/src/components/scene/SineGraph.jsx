import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "../../utils/validate";

const TAU = Math.PI * 2;

/**
 * Chalk sine graph. The dot sweeps along the curve by itself;
 * hover (or touch-drag) the graph to move it yourself and read sin(x).
 */
export default function SineGraph({ x0, y0, w, amp, delay = 1.7 }) {
  const [t, setT] = useState(Math.PI / 2);
  const hover = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = now - last;
      last = now;
      if (!hover.current) setT((v) => (v + dt * 0.0006) % TAU);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const path = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const a = (i / 100) * TAU;
      pts.push(`${(x0 + (a / TAU) * w).toFixed(1)},${(y0 - amp * Math.sin(a)).toFixed(1)}`);
    }
    return "M" + pts.join(" L");
  }, [x0, y0, w, amp]);

  const dx = x0 + (t / TAU) * w;
  const dy = y0 - amp * Math.sin(t);
  const label = `sin(${(t / Math.PI).toFixed(2)}π) = ${Math.sin(t).toFixed(2)}`;
  const tipW = 168;
  const tipX = Math.min(Math.max(dx - tipW / 2, x0 - 6), x0 + w - tipW + 40);
  const tipY = y0 - amp - 46; // fixed row above the graph; only slides sideways
  const piX = x0 + w / 2;

  const move = (e) => {
    const svg = e.currentTarget.ownerSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    hover.current = true;
    setT(Math.min(1, Math.max(0, (p.x - x0) / w)) * TAU);
  };

  return (
    <g className="anim" style={{ "--d": `${delay - 0.3}s` }}>
      <g fill="none" stroke="var(--chalk)" strokeWidth="2.6" strokeLinecap="round">
        <path d={`M${x0 - 14} ${y0} H${x0 + w + 18}`} />
        <path d={`M${x0 + w + 10} ${y0 - 5} l9 5 l-9 5`} />
        <path d={`M${x0} ${y0 + amp + 14} V${y0 - amp - 22}`} />
        <path d={`M${x0 - 5} ${y0 - amp - 12} l5 -9 l5 9`} />
        <path d={`M${piX} ${y0 - 4} v8 M${x0 + w} ${y0 - 4} v8`} strokeWidth="2.2" />
      </g>
      <path
        className="draw"
        pathLength="1"
        d={path}
        fill="none"
        stroke="#FFD166"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ "--d": `${delay}s` }}
      />
      <text x={piX} y={y0 + 24} textAnchor="middle" className="hand" fontSize="28" fill="var(--chalk)">π</text>
      <text x={x0 + w} y={y0 + 24} textAnchor="middle" className="hand" fontSize="28" fill="var(--chalk)">2π</text>
      <text x={piX} y={y0 + amp + 40} textAnchor="middle" className="hand" fontSize="32" fill="#8CC5FF">f(x) = sin x</text>

      <path d={`M${dx.toFixed(1)} ${dy.toFixed(1)} V${y0}`} stroke="#FFD166" strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <circle cx={dx} cy={dy} r="12" fill="#FF8A68" fillOpacity=".28" />
      <circle cx={dx} cy={dy} r="6.5" fill="#FF8A68" stroke="#FFF7EC" strokeWidth="2.5" />
      <g transform={`translate(${tipX.toFixed(1)},${tipY.toFixed(1)})`} pointerEvents="none">
        <rect width={tipW} height="28" rx="14" fill="#FFF7EC" fillOpacity=".14" stroke="#FFD166" strokeWidth="1.8" />
        <text x={tipW / 2} y="21" textAnchor="middle" className="hand" fontSize="25" fill="#FFF7EC">{label}</text>
      </g>

      {/* invisible hit area for hover / touch */}
      <rect
        x={x0 - 10}
        y={y0 - amp - 40}
        width={w + 30}
        height={amp * 2 + 80}
        fill="transparent"
        style={{ touchAction: "none", cursor: "crosshair" }}
        onPointerMove={move}
        onPointerDown={move}
        onPointerLeave={() => (hover.current = false)}
      />
    </g>
  );
}
