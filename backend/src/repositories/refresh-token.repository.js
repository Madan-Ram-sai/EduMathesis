import { pool,withTransaction } from "../db/index.js";

export async function storeRefreshToken({ userId, jti, tokenHash, expiresAt }) {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, jti, tokenHash, expiresAt]
  );
}

export async function rotateRefreshToken({ userId, oldJti, oldTokenHash, newJti, newTokenHash, newExpiresAt }) {
  return withTransaction(async (client) => {
    const revokeResult = await client.query(// for security and loga the old refresh token and stored insted of deleting
      `UPDATE refresh_tokens
       SET is_revoked = TRUE, replaced_by = $1
       WHERE user_id = $2 AND jti = $3 AND token_hash = $4
       AND is_revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
       RETURNING id`,
      [newJti, userId, oldJti, oldTokenHash]
    );

    if (revokeResult.rowCount !== 1) return false;

    await client.query(
      `INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, newJti, newTokenHash, newExpiresAt]
    );
    return true;
  });
}

export async function revokeRefreshToken({ userId, jti }) {
  await pool.query(
    `UPDATE refresh_tokens SET is_revoked = TRUE
     WHERE user_id = $1 AND jti = $2 AND is_revoked = FALSE`,
    [userId, jti]
  );
}
