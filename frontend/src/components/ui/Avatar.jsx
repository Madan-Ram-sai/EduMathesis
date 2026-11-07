import { getAvatarSrc } from "../../utils/avatar";

/** Uploaded or assigned avatar, with a stable bundled avatar as fallback. */
export default function Avatar({ user, size = 40 }) {
  const seed = user?.username || user?.name || "guest";
  return (
    <img
      className="avatar"
      style={{ width: size, height: size }}
      src={getAvatarSrc(user?.avatarUrl, seed)}
      alt=""
    />
  );
}
