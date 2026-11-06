import { useEffect, useRef } from "react";

const INK = "#22304D";

/**
 * Prof. Pi: a π with glasses and a mortarboard. Drawn as an SVG <g> (~130 x 170 units).
 * - pupils follow the cursor
 * - mood "hide": covers his eyes (password fields)
 * - mood "cheer": hops and waves
 */
export default function ProfPi({ mood = "idle" }) {
  const root = useRef(null);
  const left = useRef(null);
  const right = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      const g = root.current;
      if (!g) return;
      const r = g.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.5);
      const dy = e.clientY - (r.top + r.height * 0.3);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 260) * 4.2;
      const t = `translate(${((dx / d) * k).toFixed(2)}px, ${((dy / d) * k).toFixed(2)}px)`;
      if (left.current) left.current.style.transform = t;
      if (right.current) right.current.style.transform = t;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <g ref={root} className={`pi ${mood}`} strokeLinejoin="round">
      {/* legs + shoes */}
      <rect x="34" y="78" width="22" height="66" rx="11" fill="#FFD166" stroke={INK} strokeWidth="4" />
      <rect x="74" y="78" width="22" height="66" rx="11" fill="#FFD166" stroke={INK} strokeWidth="4" />
      <ellipse cx="42" cy="150" rx="17" ry="8" fill="#FF8A68" stroke={INK} strokeWidth="4" />
      <ellipse cx="90" cy="150" rx="17" ry="8" fill="#FF8A68" stroke={INK} strokeWidth="4" />

      {/* left arm points at the graph */}
      <path d="M14 64 Q-12 58 -40 42" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M-36 44 L-82 20" stroke="#E8C27A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="-40" cy="42" r="6" fill="#FFD166" stroke={INK} strokeWidth="3" />

      {/* right arm hangs, waves when cheering */}
      <g className="arm-r">
        <path d="M116 64 Q132 82 126 104" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="126" cy="106" r="6" fill="#FFD166" stroke={INK} strokeWidth="3" />
      </g>

      {/* head */}
      <rect x="10" y="26" width="110" height="58" rx="28" fill="#FFD166" stroke={INK} strokeWidth="4" />
      <circle cx="46" cy="58" r="12" fill="#fff" fillOpacity=".9" stroke={INK} strokeWidth="3.5" />
      <circle cx="84" cy="58" r="12" fill="#fff" fillOpacity=".9" stroke={INK} strokeWidth="3.5" />
      <path d="M58 57h14" stroke={INK} strokeWidth="3.5" />
      <g className="pupil" ref={left}>
        <circle cx="46" cy="58" r="4.2" fill={INK} />
        <circle cx="47.5" cy="56.5" r="1.4" fill="#fff" />
      </g>
      <g className="pupil" ref={right}>
        <circle cx="84" cy="58" r="4.2" fill={INK} />
        <circle cx="85.5" cy="56.5" r="1.4" fill="#fff" />
      </g>
      <path className="smile" d="M55 74 Q65 82 75 74" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="27" cy="72" rx="7" ry="4.5" fill="#FF8A68" fillOpacity=".55" />
      <ellipse cx="103" cy="72" rx="7" ry="4.5" fill="#FF8A68" fillOpacity=".55" />

      {/* hands that cover the eyes */}
      <g className="hands">
        <ellipse cx="46" cy="58" rx="16" ry="14" fill="#FFD166" stroke={INK} strokeWidth="4" />
        <ellipse cx="84" cy="58" rx="16" ry="14" fill="#FFD166" stroke={INK} strokeWidth="4" />
      </g>

      {/* mortarboard */}
      <polygon points="18,24 65,6 112,24 65,40" fill="#2F3F6E" stroke={INK} strokeWidth="4" />
      <path d="M65 24 L104 28 L104 46" stroke="#FFB3C7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="104" cy="48" r="4.5" fill="#FFB3C7" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}
