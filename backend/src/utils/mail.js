import nodemailer from "nodemailer";

// Reuse one transporter across the app instead of creating a new one per email.
// For local dev, use something like Mailtrap or Gmail SMTP with an app password.
// In production, swap to a real provider (SES, SendGrid, Resend, etc.) — same function signature.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for port 465, false for 587/other
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email. Throws if sending fails — caller decides how to handle
 * (e.g. still let registration succeed even if the email fails to send,
 * but log it, rather than blocking the whole request).
 */
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@yourapp.com",
    to,
    subject,
    html,
  });
};
