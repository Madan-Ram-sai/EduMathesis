import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { loginUserService, registerUserService, changeUserPasswordService, updateUserProfileRepo } from "../services/user.service.js";
import { verifyEmailService, generateAndSendVerificationEmail } from "../services/email-verification.service.js";
import { revokeRefreshToken } from "../repositories/refresh-token.repository.js";
import { generateAndSendPasswordResetEmail } from "../services/password-reset.service.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registeruser = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const user = await registerUserService({
    name,
    username,
    email,
    password,
    role,
    avatarLocalPath,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      user,
      "User registered successfully"
    )
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  await verifyEmailService(token);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Email verified successfully"
    )
  )
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUser({ email: normalizedEmail, username: "" });

  // Always return the same success response whether or not the account
  // exists — prevents leaking which emails are registered.
  if (user && !user.is_email_verified) {
    await generateAndSendVerificationEmail(user);
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "If an account with that email exists and is unverified, a verification link has been sent.")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const loggedUser = await loginUserService({ email, username, password });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  }
  return res.status(200)
    .cookie("accessToken", loggedUser.accessToken, options)
    .cookie("refreshToken", loggedUser.refreshToken, options)
    .json(new ApiResponse(200, loggedUser.user, "User logged in successfully"))
});

// profile related controllers
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user; // Assuming user is attached to the request object after authentication

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      "User profile retrieved successfully"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken); // mark this device's token as revoked in DB
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await getUser({ email: normalizedEmail, username: "" });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await generateAndSendPasswordResetEmail(user);

  return res.status(200).json(
    new ApiResponse(200, {}, "password reset email sent successfully")
  );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username } = req.query;
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await getUser({ email, username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "user retrieved successfully")
  )
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, username, email } = req.body;
  if (!name && !username && !email) {
    throw new ApiError(400, "At least one field is required to update profile");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (username !== undefined) updateData.username = username;
  if (email !== undefined) updateData.email = email;

  const updatedUser = await updateUserProfileRepo(userId, updateData);

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200)
    .json(new ApiResponse(200, updatedUser, "User profile updated successfully"))
});

const UpdateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const avatarUploaded = await uploadOnCloudinary(avatarLocalPath);
  const updatedUser = await updateUserProfileRepo(userId, { avatar_url: avatarUploaded.url });

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200)
    .json(new ApiResponse(200, updatedUser, "User avatar updated successfully"))
})

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required");
  }
  if (newPassword === currentPassword) {
    throw new ApiError(400, "New password must be different from the current password");
  }
  const updatedUser = await changeUserPasswordService({ userId, currentPassword, newPassword });

  return res.status(200)
    .json(new ApiResponse(200, updatedUser, "Password updated successfully"))
});


export { registeruser, getUserProfile, loginUser, verifyEmail, resendVerificationEmail, logoutUser, forgetPassword, updateUserProfile, UpdateAvatar, changePassword, getCurrentUser };