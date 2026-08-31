import { pool } from "../db/index.js";

/**
 * Deletes any existing unverified tokens for this user before issuing a new one.
 * Keeps only ONE valid token active at a time per user (old links stop working
 * once a new one is requested).
 */
export async function deleteUnverifiedTokensForUser(userId) {
  await pool.query(
    `DELETE FROM email_verifications WHERE user_id = $1 AND verified_at IS NULL`,
    [userId]
  );
}

export async function insertVerificationToken({ userId, token, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO email_verifications (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token, expires_at`,
    [userId, token, expiresAt]
  );
  return result.rows[0];
}

export async function findVerificationByToken(token) {
  const result = await pool.query(
    `SELECT id, user_id, token, expires_at, verified_at
     FROM email_verifications
     WHERE token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

export async function markTokenAsVerified(token) {
  await pool.query(
    `UPDATE email_verifications SET verified_at = now() WHERE token = $1`,
    [token]
  );
}

export async function markUserEmailVerified(userId) {
  await pool.query(
    `UPDATE users SET is_email_verified = true WHERE id = $1`,
    [userId]
  );
}