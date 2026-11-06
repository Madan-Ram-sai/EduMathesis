import { useState } from "react";

/** A friendly cartoon face (DiceBear "lorelei"). Falls back to the first letter if it can't load. */
export default function Face({ seed, name, bg = "b6e3f4", color, size = 40, className = "" }) {
  const [bad, setBad] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.42, "--c": color || `#${bg}` };
  if (bad) {
    return (
      <span className={`face fb ${className}`} style={style}>
        {(name || seed || "?")[0]}
      </span>
    );
  }
  return (
    <img
      className={`face ${className}`}
      style={style}
      alt=""
      loading="lazy"
      src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`}
      onError={() => setBad(true)}
    />
  );
}
