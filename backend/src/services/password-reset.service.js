import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../db/index.js";

const TOKEN_EXPIRY_HOURS = 24;

export const generateAndSendPasswordResetEmail = async (user) => {
  // Deletes any existing unused password reset tokens for this user
  await prisma.passwordReset.delete({
    where:{
      userId:user.id,
    }
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data:{
      userId:user.id,
      token:token,
      expiresAt:expiresAt,
    }
  });

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

  const record = await prisma.passwordReset.findFirst({
    where:{
      token:token,
    }
  });

  if (!record) {
    throw new ApiError(400, "Invalid password reset link");
  }
  if (record.used_at) {
    throw new ApiError(400, "This password reset link has already been used");
  }
  if (new Date(record.expiresAt) < new Date()) {
    throw new ApiError(400, "This password reset link has expired. Please request a new one.");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where:{
      userId:record.userId,
      deletedAt: null,
    },
    data:{
      passwordHash:newPasswordHash,
    }
  });
  // marking as password reset at this time
  await prisma.passwordReset.update({
    where:{
      token:token,
    },
    data:{
      usedAt: new Date(),
    }
  })

  // Security: Revoke all device sessions on password reset
  
  //Even though your database columns use snake_case (user_id, expires_at, used_at), Prisma always returns JavaScript objects using your schema's camelCase property names.
  // This means properties like record.user_id, record.expires_at, and record.used_at will all evaluate to undefined.
  await prisma.refreshToken.update({// here update works bez. jti is unique, else we need to use updateMany
    where:{
      userId:record.userId,
      jti:record.jti,
      isRevoked:false,
    },
    data:{
      isRevoked:true,
    }
  });

  // return { userId: record.user_id };//so record.user_id wrong
  return {userId: record.userId};
};
