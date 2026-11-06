import { ShieldCheck } from "lucide-react";

export default function Callout({ title, children }) {
  return (
    <div className="callout">
      <ShieldCheck size={20} />
      <div>
        <b>{title}</b>
        <small>{children}</small>
      </div>
    </div>
  );
}