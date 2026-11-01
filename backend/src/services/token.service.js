import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "crypto";
import { prisma } from "../db/index.js";

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

export const storeRefreshToken = ({ userId, jti, tokenHash, expiresAt }) =>
  prisma.refreshToken.create({ data: { userId, jti, tokenHash, expiresAt } });

export const revokeRefreshToken = ({ userId, jti }) =>
  prisma.refreshToken.updateMany({ where: { userId, jti, isRevoked: false }, data: { isRevoked: true } });

export const revokeAllUserTokens = (userId, db = prisma) =>
  db.refreshToken.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } });

export const rotateRefreshToken = ({ userId, oldJti, oldTokenHash, newJti, newTokenHash, newExpiresAt }) =>
  prisma.$transaction(async (tx) => {
    const { count } = await tx.refreshToken.updateMany({
      where: { userId, jti: oldJti, tokenHash: oldTokenHash, isRevoked: false, expiresAt: { gt: new Date() } },
      data: { isRevoked: true, replacedBy: newJti },
    });
    if (count !== 1) return false;
    await tx.refreshToken.create({ data: { userId, jti: newJti, tokenHash: newTokenHash, expiresAt: newExpiresAt } });
    return true;
  });