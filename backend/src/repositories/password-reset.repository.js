import { pool } from "../db/index.js";

/**
 * Deletes any existing unused password reset tokens for this user.
 */
export async function deleteUnusedResetTokensForUser(userId) {
  await pool.query(
    `DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL`,
    [userId]
  );
}

export const deleteExistingVerificationToken = deleteUnusedResetTokensForUser;
export const deleteExistingResetToken = deleteUnusedResetTokensForUser;

export async function insertPasswordResetToken({ userId, token, expiresAt }) {

  const result = await pool.query(
    `INSERT INTO password_resets (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token, expires_at`,
    [userId, token, expiresAt]
  );
  return result.rows[0];
}

export const insertVerificationToken = insertPasswordResetToken;
export const insertResetToken = insertPasswordResetToken;

export async function findPasswordResetByToken(token) {
  const result = await pool.query(
    `SELECT id, user_id, token, expires_at, used_at
     FROM password_resets
     WHERE token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

export async function markPasswordResetAsUsed(token) {
  await pool.query(
    `UPDATE password_resets SET used_at = NOW() WHERE token = $1`,
    [token]
  );
}
