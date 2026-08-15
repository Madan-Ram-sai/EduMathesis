import mongoose, { Schema } from "mongoose";

const emailVerificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    verified_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);
