import mongoose, { Schema } from "mongoose";

const teacherRequestSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const TeacherRequest = mongoose.model(
  "TeacherRequest",
  teacherRequestSchema
);
