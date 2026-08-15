import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    token_hash: {
      type: String,
      required: true,
    },
    is_revoked: {
      type: Boolean,
      default: false,
    },
    replaced_by: {
      type: String,
      default: null,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);
