import mongoose, { Schema } from "mongoose";

const inviteLinkSchema = new Schema(
  {
    community_id: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    created_by: {
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
      default: null,
    },
    max_uses: {
      type: Number,
      default: null,
    },
    use_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const InviteLink = mongoose.model("InviteLink", inviteLinkSchema);
