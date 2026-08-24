import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "crypto";

export function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
}

export function createRefreshToken(userId) {
  const jti = randomUUID();
  const token = jwt.sign({ id: userId, jti }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  const { exp } = jwt.decode(token);
  return { token, jti, expiresAt: new Date(exp * 1000) };
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

export function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiry(token) {
  const { exp } = jwt.decode(token);
  return new Date(exp * 1000);
}
