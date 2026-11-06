export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

const tips = ["Use at least 8 characters", "Mix upper & lower case", "Add a number", "Add a symbol or go longer"];

export const strength = (pw) => {
  const ok = [
    pw.length >= 8,
    /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    /\d/.test(pw),
    /[^A-Za-z0-9]/.test(pw) || pw.length >= 12,
  ];
  const score = ok.filter(Boolean).length;
  return { score, hint: score === 4 ? "Strong — nice one!" : tips[ok.indexOf(false)] };
};