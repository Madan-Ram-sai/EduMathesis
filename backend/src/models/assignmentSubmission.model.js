import mongoose, { Schema } from "mongoose";

const assignmentSubmissionSchema = new Schema(
  {
    assignment_id: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted",
    },
    grade: {
      type: String,
      default: "",
    },
    feedback: {
      type: String,
      default: "",
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSubmissionSchema.index(
  { assignment_id: 1, student_id: 1 },
  { unique: true }
);

export const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
