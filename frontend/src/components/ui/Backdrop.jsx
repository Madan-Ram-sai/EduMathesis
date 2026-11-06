import { Layer } from "../../hooks/Parallax.jsx";

const blobs = [
  ["bl1", -40],
  ["bl2", 50],
  ["bl3", -60],
  ["bl4", 36],
];

export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {blobs.map(([c, d]) => (
        <Layer key={c} depth={d} className={`blob ${c}`} />
      ))}
      <div className="floor" />
    </div>
  );
}