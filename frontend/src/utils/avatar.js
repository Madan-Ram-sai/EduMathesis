const avatarCount = 20;

const avatarPath = (index) =>
  `${import.meta.env.BASE_URL}avatars/avatar_${String(index + 1).padStart(2, "0")}.svg`;

export function getAvatarSrc(avatarUrl, seed = "guest") {
  if (avatarUrl) {
    return avatarUrl.startsWith("/avatars/")
      ? `${import.meta.env.BASE_URL}${avatarUrl.slice(1)}`
      : avatarUrl;
  }

  const hash = [...String(seed)].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  return avatarPath(hash % avatarCount);
}
