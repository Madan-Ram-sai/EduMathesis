import Face from "../scene/Face";

const bgs = ["b6e3f4", "ffd5dc", "ffe9a8", "d1f4d9", "e4d8ff"];
const bgFor = (s = "") => bgs[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % bgs.length];

/** Uploaded photo if the user has one, otherwise a friendly cartoon face (letter if offline). */
export default function Avatar({ user, size = 40 }) {
  if (user?.avatarUrl) {
    return <img className="avatar" style={{ width: size, height: size }} src={user.avatarUrl} alt="" />;
  }
  const seed = user?.username || user?.name || "guest";
  return <Face seed={seed} name={user?.name} bg={bgFor(seed)} size={size} />;
}
