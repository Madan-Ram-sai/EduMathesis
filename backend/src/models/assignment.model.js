import mongoose, { Schema } from "mongoose";

const assignmentSchema = new Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    file_url: {
      type: String,
      default: "",
    },
    due_date: {
      type: Date,
      required: true,
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

export const Assignment = mongoose.model("Assignment", assignmentSchema);
