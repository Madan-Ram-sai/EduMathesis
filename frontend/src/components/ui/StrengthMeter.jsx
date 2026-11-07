import { strength } from "../../utils/validate";

export default function StrengthMeter({ pw }) {
  if (!pw) return null;
  const { score, hint } = strength(pw);
  return (
    <div className="strength" data-score={score}>
      <div className="meter" role="img" aria-label={`Password strength ${score} of 4`}>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i < score ? "on" : ""} />
        ))}
      </div>
      <small>{hint}</small>
    </div>
  );
}
