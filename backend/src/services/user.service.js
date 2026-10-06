import bcrypt from "bcrypt";
import {
  getActiveUserById,
  getActiveUserForAuthentication,
  getUser,
  getUserByEmail,
  getUserByOAuth,
  insertUser,
  updateOAuthDetails,
  updateUserProfileRepo,
  changeUserPasswordRepo,
  updateUserRole,
  createTeacherRequestRepo,
  getTeacherRequestByUserIdRepo,
  getAllTeacherRequestsRepo,
  getTeacherRequestByIdRepo,
  updateTeacherRequestStatusRepo,
  searchTeachersRepo,
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
import { generateAndSendVerificationEmail } from "./email-verification.service.js";

/**
 * Register a new user (always receives 'student' role by default).
 * Email verification is sent upon successful registration.
 */
const registerUserService = async ({
  name,
  username,
  email,
  password,
  bio = "",
  avatarLocalPath,
}) => {
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Name, email, and password are required fields");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // If username is not explicitly provided, derive a clean username from email
  let finalUsername = username?.trim();
  if (!finalUsername) {
    const emailPrefix = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    finalUsername = `${emailPrefix}_${randomNum}`;
  }

  const existingUser = await getActiveUserForAuthentication(finalUsername, normalizedEmail);

  if (existingUser.email_exists) {
    throw new ApiError(409, "User with this email already exists");
  }

  if (existingUser.username_exists) {
    throw new ApiError(409, "User with this username already exists");
  }

  let avatarUrl = "";
  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (avatar?.url) {
      avatarUrl = avatar.url;
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let newUser;
  try {
    newUser = await insertUser({
      name: name.trim(),
      username: finalUsername,
      email: normalizedEmail,
      passwordHash,
      role: "student", // Global role is fixed to student on registration
      avatarUrl,
      bio: bio?.trim() || "",
      isEmailVerified: false,
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new ApiError(409, "User with this email or username already exists");
    }
    throw error;
  }

  // Trigger email verification link
  await generateAndSendVerificationEmail(newUser);

  return newUser;
};

/**
 * Login user via email/username and password.
 * Checks email verification before issuing tokens.
 */
const loginUserService = async ({ email, username, password }) => {
  if ((!email?.trim() && !username?.trim()) || !password) {
    throw new ApiError(400, "Email or username and password are required fields");
  }

  const normalizedEmail = email?.toLowerCase().trim() || "";
  const user = await getUser({ email: normalizedEmail, username: username?.trim() || "" });

  if (!user) {
    throw new ApiError(401, "Invalid email/username or password");
  }

  if (!user.password_hash) {
    throw new ApiError(400, "This account uses OAuth login. Please log in with Google/GitHub.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email/username or password");
  }

  // Requirement: Email verification required before login is allowed
  if (!user.is_email_verified) {
    throw new ApiError(403, "Email verification required. Please verify your email before logging in.");
  }

  const accessToken = createAccessToken(user);
  const refresh = createRefreshToken(user.id);

  await storeRefreshToken({
    userId: user.id,
    jti: refresh.jti,
    tokenHash: hashRefreshToken(refresh.token),
    expiresAt: refresh.expiresAt,
  });

  const { password_hash, ...loggedUser } = user;

  return {
    user: loggedUser,
    accessToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
};

/**
 * Handle OAuth login or registration (Google / GitHub).
 */
const oauthLoginOrRegisterService = async ({ provider, oauthId, email, name, avatarUrl }) => {
  if (!provider || !oauthId || !email) {
    throw new ApiError(400, "Invalid OAuth payload: provider, oauthId, and email are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await getUserByOAuth(provider, oauthId);

  if (!user) {
    // Check if user exists by email
    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
      // Link OAuth provider to existing user account and mark email as verified
      user = await updateOAuthDetails({
        userId: existingUser.id,
        provider,
        oauthId,
      });
    } else {
      // Create a new OAuth user (automatically email-verified)
      const emailPrefix = normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `${emailPrefix}_${randomNum}`;

      user = await insertUser({
        name: name || emailPrefix,
        username: generatedUsername,
        email: normalizedEmail,
        passwordHash: null,
        role: "student",
        avatarUrl: avatarUrl || "",
        bio: "",
        isEmailVerified: true,
        oauthProvider: provider,
        oauthId,
      });
    }
  }

  const accessToken = createAccessToken(user);
  const refresh = createRefreshToken(user.id);

  await storeRefreshToken({
    userId: user.id,
    jti: refresh.jti,
    tokenHash: hashRefreshToken(refresh.token),
    expiresAt: refresh.expiresAt,
  });

  return {
    user,
    accessToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
};

/**
 * Rotates the refresh token and issues a new access token.
 */
const refreshUserSession = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is required");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await getActiveUserById(decoded.id);
  if (!user) throw new ApiError(401, "User not found or account deactivated");

  const refresh = createRefreshToken(user.id);
  const rotated = await rotateRefreshToken({
    userId: user.id,
    oldJti: decoded.jti,
    oldTokenHash: hashRefreshToken(refreshToken),
    newJti: refresh.jti,
    newTokenHash: hashRefreshToken(refresh.token),
    newExpiresAt: refresh.expiresAt,
  });

  if (!rotated) {
    throw new ApiError(401, "Refresh token has been revoked or already used");
  }

  const accessToken = createAccessToken(user);
  return {
    accessToken,
    accessExpiresAt: getTokenExpiry(accessToken),
    refreshToken: refresh.token,
    refreshExpiresAt: refresh.expiresAt,
  };
};

/**
 * Logout from current device by revoking token jti.
 */
const logoutUserSession = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const { id, jti } = verifyRefreshToken(refreshToken);
    await revokeRefreshToken({ userId: id, jti });
  } catch {
    // Suppress error if token is already expired or malformed
  }
};

/**
 * Authenticated user profile update.
 */
const updateUserProfileService = async ({ userId, name, username, bio, avatarLocalPath }) => {
  const updateData = {};

  if (name !== undefined && name.trim() !== "") {
    updateData.name = name.trim();
  }
  if (username !== undefined && username.trim() !== "") {
    const cleanUsername = username.trim();
    const existing = await getActiveUserForAuthentication(cleanUsername, "");
    if (existing.username_exists) {
      const currentUser = await getActiveUserById(userId);
      if (currentUser?.username !== cleanUsername) {
        throw new ApiError(409, "Username is already taken");
      }
    }
    updateData.username = cleanUsername;
  }
  if (bio !== undefined) {
    updateData.bio = bio.trim();
  }

  if (avatarLocalPath) {
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (avatar?.url) {
      updateData.avatar_url = avatar.url;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "At least one field (name, username, bio, avatar) is required to update profile");
  }

  const updatedUser = await updateUserProfileRepo(userId, updateData);
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
};

/**
 * Authenticated user password change.
 */
const changeUserPasswordService = async ({ userId, currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from the current password");
  }

  const user = await getActiveUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userWithPassword = await getUser({ email: user.email, username: user.username });
  if (!userWithPassword?.password_hash) {
    throw new ApiError(400, "OAuth accounts do not have a password. Use password reset or OAuth login.");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await changeUserPasswordRepo({ userId, newPasswordHash });

  // Revoke refresh tokens for security
  await revokeRefreshToken({ userId });

  return await getActiveUserById(userId);
};

/* ============================================================
 * TEACHER APPROVAL FLOW SERVICES
 * ============================================================ */

/**
 * Student requests to become a teacher.
 */
const requestTeacherRoleService = async (userId) => {
  const user = await getActiveUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "teacher" || user.role === "admin") {
    throw new ApiError(400, `User already has global role '${user.role}'`);
  }

  const existingRequest = await getTeacherRequestByUserIdRepo(userId);
  if (existingRequest && existingRequest.status === "pending") {
    throw new ApiError(400, "You already have a pending teacher role request.");
  }

  return await createTeacherRequestRepo(userId);
};

/**
 * Admin views all teacher requests.
 */
const getTeacherRequestsService = async (status = null) => {
  return await getAllTeacherRequestsRepo(status);
};

/**
 * Admin approves or rejects a teacher request.
 */
const reviewTeacherRequestService = async ({ requestId, adminId, status }) => {
  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
  }

  const request = await getTeacherRequestByIdRepo(requestId);
  if (!request) {
    throw new ApiError(404, "Teacher request not found");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, `Teacher request has already been ${request.status}`);
  }

  // Update request status
  const updatedRequest = await updateTeacherRequestStatusRepo({
    requestId,
    status,
    adminId,
  });

  // On approval, update user's global role to teacher
  if (status === "approved") {
    await updateUserRole({ userId: request.user_id, role: "teacher" });
  }

  return updatedRequest;
};

/* ============================================================
 * SEARCH & DISCOVERY SERVICES
 * ============================================================ */

const searchTeachersService = async ({ query = "", limit = 20, offset = 0 }) => {
  return await searchTeachersRepo({ query, limit, offset });
};

const getUserProfileService = async (userId) => {
  const user = await getActiveUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

export {
  registerUserService,
  loginUserService,
  oauthLoginOrRegisterService,
  refreshUserSession,
  logoutUserSession,
  updateUserProfileService,
  changeUserPasswordService,
  requestTeacherRoleService,
  getTeacherRequestsService,
  reviewTeacherRequestService,
  searchTeachersService,
  getUserProfileService,
};
