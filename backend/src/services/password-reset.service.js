import {ApiError} from "../utils/ApiError.js";
import {sendEmail} from "../utils/mail.js";
import crypto from "crypto";
import { insertVerificationToken, deleteExistingVerificationToken } from "../repositories/password-reset.repository.js";

const TOKEN_EXPIRY_HOURS = 24;

export const generateAndSendPasswordResetEmail = async (user) =>{
    await deleteExistingVerificationToken(user.id);// to delete old token if exists , as it won't work

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await insertVerificationToken(user.id, token, expiresAt);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    
    await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password. This link expires in ${TOKEN_EXPIRY_HOURS} hours.</p>
        <a href="${resetUrl}">${resetUrl}</a>
        `,
    });
};
