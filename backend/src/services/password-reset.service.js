import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  insertPasswordResetToken,
  deleteUnusedResetTokensForUser,
  findPasswordResetByToken,
  markPasswordResetAsUsed,
} from "../repositories/password-reset.repository.js";
import { changeUserPasswordRepo } from "../repositories/user.repository.js";
import { revokeRefreshToken } from "../repositories/refresh-token.repository.js";

const TOKEN_EXPIRY_HOURS = 24;

export const generateAndSendPasswordResetEmail = async (user) => {
  await deleteUnusedResetTokensForUser(user.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await insertPasswordResetToken({ userId: user.id, token, expiresAt });

  //const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in ${TOKEN_EXPIRY_HOURS} hour(s).</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    throw new ApiError(500, "Failed to send password reset email. Please try again later.");
  }
};

export const resetPasswordWithTokenService = async ({ token, newPassword }) => {
  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const record = await findPasswordResetByToken(token);

  if (!record) {
    throw new ApiError(400, "Invalid password reset link");
  }
  if (record.used_at) {
    throw new ApiError(400, "This password reset link has already been used");
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, "This password reset link has expired. Please request a new one.");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await changeUserPasswordRepo({ userId: record.user_id, newPasswordHash });
  await markPasswordResetAsUsed(token);

  // Security: Revoke all device sessions on password reset
  await revokeRefreshToken({ userId: record.user_id });

  return { userId: record.user_id };
};
