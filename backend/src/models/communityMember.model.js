import mongoose, { Schema } from "mongoose";

const communityMemberSchema = new Schema(
  {
    community_id: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role_in_community: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

communityMemberSchema.index(
  { community_id: 1, user_id: 1 },
  { unique: true }
);

export const CommunityMember = mongoose.model(
  "CommunityMember",
  communityMemberSchema
);
