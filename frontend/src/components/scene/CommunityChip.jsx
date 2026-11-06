import { Hash } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import Face from "./Face";
import { people } from "./people";

export default function CommunityChip() {
  return (
    <GlassCard className="chip">
      <Hash size={16} />
      <b>cse-2026</b>
      <span className="stack">
        {Object.values(people).slice(0, 4).map((p) => (
          <Face key={p.seed} seed={p.seed} name={p.name} bg={p.bg} color={p.color} size={26} />
        ))}
      </span>
      <em><i className="live-dot" /> 128 members</em>
    </GlassCard>
  );
}
