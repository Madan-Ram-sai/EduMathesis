/**
 * Liquid-glass surface.
 * `glow` (login/register only): a soft coloured light travels along the card's EDGE as the pointer moves.
 * It never paints over the content, so nothing gets hidden.
 */
export default function GlassCard({ as: Tag = "div", className = "", glow = false, children, onPointerMove, ...p }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    onPointerMove?.(e);
  };
  return (
    <Tag className={`glass ${glow ? "glow" : ""} ${className}`} onPointerMove={glow ? move : onPointerMove} {...p}>
      {children}
    </Tag>
  );
}
