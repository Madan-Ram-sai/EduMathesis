import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import {
  deleteExistingVerificationToken,
  insertVerificationToken,
  findVerificationByToken,
  markTokenAsVerified,
  markUserEmailVerified,
} from "../repositories/email-verification.repository.js";

const TOKEN_EXPIRY_HOURS = 24;

export const generateAndSendVerificationEmail = async (user) => {
  await deleteExistingVerificationToken(user.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await insertVerificationToken({ userId: user.id, token, expiresAt });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to verify your email. This link expires in ${TOKEN_EXPIRY_HOURS} hours.</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // Don't crash registration if mail server fails; token is generated and can be resent.
  }
};

export const verifyEmailService = async (token) => {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const record = await findVerificationByToken(token);

  if (!record) {
    throw new ApiError(400, "Invalid verification link");
  }
  if (record.verified_at) {
    throw new ApiError(400, "This link has already been used");
  }
  if (new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, "This verification link has expired. Please request a new one.");
  }

  await markUserEmailVerified(record.user_id);
  await markTokenAsVerified(token);

  return { userId: record.user_id };
};