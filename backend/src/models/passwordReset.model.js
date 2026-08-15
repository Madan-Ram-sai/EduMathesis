import mongoose, { Schema } from "mongoose";

const passwordResetSchema = new Schema(
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
    used_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const PasswordReset = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);
