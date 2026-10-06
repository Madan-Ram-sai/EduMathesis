import { pool } from "../db/index.js";

export const publicUserColumns = `
  id, name, username, email, avatar_url, bio, role, is_email_verified,
  oauth_provider, oauth_id, created_at, updated_at
`;

/**
 * PostgreSQL data-access functions for the users table and teacher_requests table.
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

export async function getActiveUserWithPassword(userId) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}, password_hash
     FROM users
     WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getActiveUserForAuthentication(username, email) {
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
    [email || "", username || ""]
  );

  return result.rows[0];
}

export async function getUser({ email, username }) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}, password_hash
     FROM users
     WHERE (LOWER(email) = LOWER($1) OR username = $2)
       AND deleted_at IS NULL`,
    [email || "", username || ""]
  );

  return result.rows[0] ?? null;
}

export async function getUserByEmail(email) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}, password_hash
     FROM users
     WHERE LOWER(email) = LOWER($1)
       AND deleted_at IS NULL`,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function getUserByUsername(username) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}, password_hash
     FROM users
     WHERE username = $1
       AND deleted_at IS NULL`,
    [username]
  );

  return result.rows[0] ?? null;
}

export async function getUserByOAuth(provider, oauthId) {
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users
     WHERE oauth_provider = $1 AND oauth_id = $2
       AND deleted_at IS NULL`,
    [provider, oauthId]
  );

  return result.rows[0] ?? null;
}

export async function insertUser({
  name,
  username,
  email,
  passwordHash = null,
  role = "student",
  avatarUrl = "",
  bio = "",
  isEmailVerified = false,
  oauthProvider = null,
  oauthId = null,
}) {
  const result = await pool.query(
    `INSERT INTO users (name, username, email, password_hash, role, avatar_url, bio, is_email_verified, oauth_provider, oauth_id)
     VALUES ($1, $2, LOWER($3), $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${publicUserColumns}`,
    [name, username, email, passwordHash, role, avatarUrl, bio, isEmailVerified, oauthProvider, oauthId]
  );

  return result.rows[0];
}

export async function updateOAuthDetails({ userId, provider, oauthId }) {
  const result = await pool.query(
    `UPDATE users
     SET oauth_provider = $1, oauth_id = $2, is_email_verified = TRUE, updated_at = NOW()
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING ${publicUserColumns}`,
    [provider, oauthId, userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUserProfileRepo(userId, updateData) {
  const allowedKeys = {
    name: "name",
    username: "username",
    email: "email",
    avatar_url: "avatar_url",
    avatarUrl: "avatar_url",
    bio: "bio",
  };

  const setClauses = [];
  const values = [];
  let index = 1;

  // Dynamically build SET clause: e.g., "name = $1, username = $2"
  for (const [key, val] of Object.entries(updateData)) {
    const colName = allowedKeys[key];
    if (colName && val !== undefined) {
      setClauses.push(`${colName} = $${index}`);
      values.push(val);
      index++;
    }
  }

  if (setClauses.length === 0) {
    return getActiveUserById(userId);
  }

  values.push(userId);

  const result = await pool.query(
    `UPDATE users 
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${index} AND deleted_at IS NULL
     RETURNING ${publicUserColumns}`,
    values
  );

  return result.rows[0] ?? null;
}

export async function changeUserPasswordRepo({ userId, newPasswordHash }) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING ${publicUserColumns}`,
    [newPasswordHash, userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUserRole({ userId, role }) {
  const result = await pool.query(
    `UPDATE users
     SET role = $1, updated_at = NOW()
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING ${publicUserColumns}`,
    [role, userId]
  );

  return result.rows[0] ?? null;
}

export async function softDeleteUser(userId) {
  const result = await pool.query(
    `UPDATE users
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [userId]
  );

  return result.rowCount > 0;
}

/* ============================================================
 * TEACHER REQUEST REPOSITORY FUNCTIONS
 * ============================================================ */

export async function createTeacherRequestRepo(userId) {
  const result = await pool.query(
    `INSERT INTO teacher_requests (user_id, status)
     VALUES ($1, 'pending')
     RETURNING id, user_id, status, created_at, updated_at`,
    [userId]
  );

  return result.rows[0];
}

export async function getTeacherRequestByUserIdRepo(userId) {
  const result = await pool.query(
    `SELECT id, user_id, status, reviewed_by, reviewed_at, created_at, updated_at
     FROM teacher_requests
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getAllTeacherRequestsRepo(status = null) {
  let query = `
    SELECT 
      tr.id, tr.user_id, tr.status, tr.reviewed_by, tr.reviewed_at, tr.created_at, tr.updated_at,
      u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar_url, u.bio AS user_bio
    FROM teacher_requests tr
    JOIN users u ON tr.user_id = u.id
  `;
  const params = [];

  if (status) {
    query += ` WHERE tr.status = $1`;
    params.push(status);
  }

  query += ` ORDER BY tr.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
}

export async function getTeacherRequestByIdRepo(requestId) {
  const result = await pool.query(
    `SELECT 
       tr.id, tr.user_id, tr.status, tr.reviewed_by, tr.reviewed_at, tr.created_at, tr.updated_at,
       u.name AS user_name, u.email AS user_email, u.avatar_url AS user_avatar_url, u.bio AS user_bio
     FROM teacher_requests tr
     JOIN users u ON tr.user_id = u.id
     WHERE tr.id = $1`,
    [requestId]
  );

  return result.rows[0] ?? null;
}

export async function updateTeacherRequestStatusRepo({ requestId, status, adminId }) {
  const result = await pool.query(
    `UPDATE teacher_requests
     SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $3
     RETURNING id, user_id, status, reviewed_by, reviewed_at, updated_at`,
    [status, adminId, requestId]
  );

  return result.rows[0] ?? null;
}

/* ============================================================
 * SEARCH & DISCOVERY REPOSITORY FUNCTIONS
 * ============================================================ */

export async function searchTeachersRepo({ query = "", limit = 20, offset = 0 }) {
  const searchTerm = `%${query.trim()}%`;
  const result = await pool.query(
    `SELECT ${publicUserColumns}
     FROM users
     WHERE role IN ('teacher', 'admin')
       AND deleted_at IS NULL
       AND (name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1)
     ORDER BY name ASC
     LIMIT $2 OFFSET $3`,
    [searchTerm, limit, offset]
  );

  return result.rows;
}

export async function getAllUsersRepo({ role = null, search = "", limit = 20, offset = 0 }) {
  const params = [];
  let paramIndex = 1;
  const whereClauses = ["deleted_at IS NULL"];

  if (role) {
    whereClauses.push(`role = $${paramIndex}`);
    params.push(role);
    paramIndex++;
  }

  if (search?.trim()) {
    whereClauses.push(`(name ILIKE $${paramIndex} OR username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
    params.push(`%${search.trim()}%`);
    paramIndex++;
  }

  params.push(limit, offset);

  const query = `
    SELECT ${publicUserColumns}
    FROM users
    WHERE ${whereClauses.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await pool.query(query, params);
  return result.rows;
}