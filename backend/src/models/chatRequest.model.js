import mongoose, { Schema } from "mongoose";

const chatRequestSchema = new Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    responded_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate sender_id is not equal to receiver_id
chatRequestSchema.pre("save", function (next) {
  if (this.sender_id.toString() === this.receiver_id.toString()) {
    return next(new Error("Sender and receiver cannot be the same user."));
  }
  next();
});

export const ChatRequest = mongoose.model("ChatRequest", chatRequestSchema);
