export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
export const isUsername = (v) => /^[a-zA-Z0-9_]{3,20}$/.test(v);

const tips = ["Use at least 8 characters", "Mix upper & lower case", "Add a number", "Add a symbol or go longer"];

export const strength = (pw) => {
  const ok = [
    pw.length >= 8,
    /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[^A-Za-z0-9]/.test(pw) || pw.length >= 12,
  ];
  const score = ok.filter(Boolean).length;
  return { score, hint: score === 4 ? "Looks solid!" : tips[ok.indexOf(false)] };
};

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
