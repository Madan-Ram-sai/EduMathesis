import { pool } from "../db/index.js";

const publicUserColumns = `
  id, name, email, avatar_url, role, is_email_verified,
  oauth_provider, oauth_id, created_at, updated_at
`;

/**
 * PostgreSQL data-access functions for the users table.
 *
 * This module deliberately contains SQL only: no password hashing, JWT work,
 * request validation, or ORM-style model API.
 */
export async function getActiveUserById(userId) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getActiveUserForAuthentication(username,email) {
  const result = await pool.query(
    `SELECT
       EXISTS(
         SELECT 1 FROM users
         WHERE LOWER(email) = LOWER($1)
           AND deleted_at IS NULL
       ) AS email_exists,
       EXISTS(
         SELECT 1 FROM users
         WHERE username = $2
           AND deleted_at IS NULL
       ) AS username_exists`,
    [email, username]
  );

  return result.rows[0];
}

export async function getUser({ email, username }){
  const result = await pool.query(
    `SELECT ${publicUserColumns}, password_hash
    FROM users
    WHERE (LOWER(email) = LOWER($1) OR username = $2)
    AND deleted_at IS NULL`,
    [email, username]
  );

  return result.rows[0];
}

export async function getActiveUserById(userId) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function insertUser({ name, username, email, passwordHash, role, avatarUrl }) {
  const result = await pool.query(
    `INSERT INTO users (name, username, email, password_hash, role, avatar_url)
     VALUES ($1, $2, LOWER($3), $4, $5, $6)
     RETURNING ${publicUserColumns}`,
    [name, username, email, passwordHash, role, avatarUrl]
  );

  return result.rows[0];
}

export async function updateUserProfileRepo({userId, updateData}) {
  const setClauses = [];
  const values = [];
  let index = 1;
  
  // Dynamically build SET clause: e.g., "name = $1, username = $2"
  for (const [key, value] of Object.entries(updateData)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }
  values.push(userId);

  const result = await pool.query(
    `UPDATE users 
    SET ${setClauses.join(", ")} ,updated_at=NOW()
    WHERE id=$${index} AND deleted_at IS NULL
    RETURNING ${publicUserColumns}`,
    values
  );
  return result.rows[0];
}

export async function changeUserPasswordRepo({ userId, newPasswordHash }) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash =$1, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING ${publicUserColumns}`,
    [newPasswordHash, userId]
  );
  return result.rows[0];
}