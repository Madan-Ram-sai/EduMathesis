import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
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
} from "../services/user.service.js";
import {
  verifyEmailService,
  generateAndSendVerificationEmail,
} from "../services/email-verification.service.js";
import {
  generateAndSendPasswordResetEmail,
  resetPasswordWithTokenService,
} from "../services/password-reset.service.js";
import { getUserByEmail } from "../repositories/user.repository.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

/**
 * Register user controller
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, bio } = req.body;
  const avatarLocalPath = req.file?.path || req.files?.avatar?.[0]?.path;

  const user = await registerUserService({
    name,
    username,
    email,
    password,
    bio,
    avatarLocalPath,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      user,
      "User registered successfully. Please check your email to verify your account."
    )
  );
});

/**
 * Verify email controller
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;

  await verifyEmailService(token);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully. You may now log in."));
});

/**
 * Resend verification email controller
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);

  // Always return the same success response whether or not the account
  // exists — prevents leaking which emails are registered.
  if (user && !user.is_email_verified) {
    await generateAndSendVerificationEmail(user);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "If an account with that email exists and is unverified, a verification link has been sent."
    )
  );
});

/**
 * Login user controller
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const loggedData = await loginUserService({ email, username, password });

  return res
    .status(200)
    .cookie("accessToken", loggedData.accessToken, cookieOptions)
    .cookie("refreshToken", loggedData.refreshToken, cookieOptions)
    .json(new ApiResponse(200, loggedData, "User logged in successfully"));
});

/**
 * OAuth Login / Registration controller (Google / GitHub)
 */
const oauthLogin = asyncHandler(async (req, res) => {
  const { provider, oauthId, email, name, avatarUrl } = req.body;

  const oauthData = await oauthLoginOrRegisterService({
    provider,
    oauthId,
    email,
    name,
    avatarUrl,
  });

  return res
    .status(200)
    .cookie("accessToken", oauthData.accessToken, cookieOptions)
    .cookie("refreshToken", oauthData.refreshToken, cookieOptions)
    .json(new ApiResponse(200, oauthData, "OAuth authentication successful"));
});

/**
 * Refresh user session token controller
 */
const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const sessionData = await refreshUserSession(refreshToken);

  return res
    .status(200)
    .cookie("accessToken", sessionData.accessToken, cookieOptions)
    .cookie("refreshToken", sessionData.refreshToken, cookieOptions)
    .json(new ApiResponse(200, sessionData, "Access token refreshed successfully"));
});

/**
 * Logout user controller
 */
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  await logoutUserSession(refreshToken);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

/**
 * Forgot password request controller
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "If an account with that email exists, a password reset email has been sent."
    )
  );
});

/**
 * Reset password via token controller
 */
const resetPassword = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;
  const { newPassword } = req.body;

  await resetPasswordWithTokenService({ token, newPassword });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully. You can now log in with your new password."));
});

/**
 * Get current logged-in user profile controller
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile retrieved successfully"));
});

/**
 * Update current user profile controller
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, username, bio } = req.body;
  const avatarLocalPath = req.file?.path || req.files?.avatar?.[0]?.path;

  const updatedUser = await updateUserProfileService({
    userId,
    name,
    username,
    bio,
    avatarLocalPath,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User profile updated successfully"));
});

/**
 * Update current user avatar controller
 */
const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const avatarLocalPath = req.file?.path || req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const updatedUser = await updateUserProfileService({
    userId,
    avatarLocalPath,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User avatar updated successfully"));
});

/**
 * Change current user password controller
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const updatedUser = await changeUserPasswordService({
    userId,
    currentPassword,
    newPassword,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Password changed successfully"));
});

/**
 * Request teacher role controller (Student endpoint)
 */
const requestTeacherRole = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const teacherRequest = await requestTeacherRoleService(userId);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        teacherRequest,
        "Teacher role request submitted successfully. Waiting for admin approval."
      )
    );
});

/**
 * Get all teacher requests controller (Admin endpoint)
 */
const getTeacherRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const requests = await getTeacherRequestsService(status || null);

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Teacher requests retrieved successfully"));
});

/**
 * Review teacher request controller (Admin endpoint)
 */
const reviewTeacherRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const adminId = req.user.id;
  const { status } = req.body;

  const updatedRequest = await reviewTeacherRequestService({
    requestId,
    adminId,
    status,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRequest,
        `Teacher request status updated to '${status}' successfully`
      )
    );
});

/**
 * Dedicated teacher search controller (Fuzzy match by name/username/email)
 */
const searchTeachers = asyncHandler(async (req, res) => {
  const { q = "", limit = 20, offset = 0 } = req.query;

  const teachers = await searchTeachersService({
    query: String(q),
    limit: Number(limit) || 20,
    offset: Number(offset) || 0,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers search results retrieved successfully"));
});

/**
 * Get user by ID controller
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await getUserProfileService(id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details retrieved successfully"));
});

export {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  oauthLogin,
  refreshSession,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  changePassword,
  requestTeacherRole,
  getTeacherRequests,
  reviewTeacherRequest,
  searchTeachers,
  getUserById,
};