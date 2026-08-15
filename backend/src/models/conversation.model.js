import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
  {
    user_one_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_two_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { user_one_id: 1, user_two_id: 1 },
  { unique: true }
);

// Validate user_one_id is not equal to user_two_id
conversationSchema.pre("save", function (next) {
  if (this.user_one_id.toString() === this.user_two_id.toString()) {
    return next(new Error("Conversation users must be distinct."));
  }
  next();
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
