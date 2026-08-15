import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
