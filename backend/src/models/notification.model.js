import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "new_assignment",
        "new_video",
        "doubt_reply",
        "chat_request",
        "teacher_approved",
      ],
      required: true,
    },
    ref_type: {
      type: String,
      required: true,
    },
    ref_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    community_id: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("Notification", notificationSchema);
