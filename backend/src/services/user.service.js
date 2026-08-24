import bcrypt from "bcrypt";
import {
  getActiveUserById,
  getActiveUserForAuthentication,
  getUser,
  insertUser,
} from "../repositories/user.repository.js";
import {
  revokeRefreshToken,
  rotateRefreshToken,
  storeRefreshToken,
} from "../repositories/refresh-token.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiry,
  hashRefreshToken,
  verifyRefreshToken,
} from "./token.service.js";

const registerUserService = async ({ name, username, email, password, role, avatarLocalPath }) => {
  if (!name?.trim() || !username?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Name, username, email and password are required fields");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await getActiveUserForAuthentication(username, normalizedEmail);

  if (existingUser.email_exists) {
    throw new ApiError(409, "User with this email already exists");
  }
  
  if (existingUser.username_exists) {
    throw new ApiError(409, "User with this username already exists");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar localpath is missing");
  }
  let avatarUrl = "";
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }
  avatarUrl = avatar.url;

  const allowedRoles = ["student", "teacher", "admin"];
  if (role && !allowedRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await insertUser({
      name: name.trim(),
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role || "student",
      avatarUrl,
    });
  } catch (error) {
    // The database unique constraint remains the source of truth under races.
    if (error.code === "23505") {
      throw new ApiError(409, "User with this email already exists");
    }
    throw error;
  }
};


const loginUserService = async ({ email, username, password }) => {
  if ((!email?.trim() && !username?.trim()) || !password) {
    throw new ApiError(400, "Email or username are required fields");
  }

  const normalizedEmail = email?.toLowerCase().trim() || "";
  const user = await getUser({ email: normalizedEmail, username: username?.trim() || "" });
  
  if (!user) {
    throw new ApiError(401, "Invalid email or username");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const accessToken = createAccessToken(user);
  const refresh = createRefreshToken(user.id);
  await storeRefreshToken({
    userId: user.id,
    jti: refresh.jti,
    tokenHash: hashRefreshToken(refresh.token),
    expiresAt: refresh.expiresAt,
  });

  const loginedUser = {
    id: user.id,
    name:user.name,
    username:user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url
  }

  return {
    user: loginedUser,
    accessToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
};

const refreshUserSession = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is required");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await getActiveUserById(decoded.id);
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const refresh = createRefreshToken(user.id);
  const rotated = await rotateRefreshToken({
    userId: user.id,
    oldJti: decoded.jti,
    oldTokenHash: hashRefreshToken(refreshToken),
    newJti: refresh.jti,
    newTokenHash: hashRefreshToken(refresh.token),
    newExpiresAt: refresh.expiresAt,
  });
  if (!rotated) throw new ApiError(401, "Refresh token has been revoked or already used");

  const accessToken = createAccessToken(user);
  return {
    accessToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
};

const logoutUserSession = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const { id, jti } = verifyRefreshToken(refreshToken);
    await revokeRefreshToken({ userId: id, jti });
  } catch {
    // Clear the browser cookies even if this token is already invalid or expired.
  }
};

export { registerUserService, loginUserService, refreshUserSession, logoutUserSession };
