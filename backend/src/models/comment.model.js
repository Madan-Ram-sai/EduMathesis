import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent_type: {
      type: String,
      enum: ["video", "post"],
      required: true,
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "parent_model",
    },
    parent_model: {
      type: String,
      enum: ["Video", "Post"],
    },
    parent_comment_id: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: {
      type: String,
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

// Pre-save hook to ensure refPath maps 'video' -> 'Video' and 'post' -> 'Post'
commentSchema.pre("save", function (next) {
  if (this.parent_type === "video") {
    this.parent_model = "Video";
  } else if (this.parent_type === "post") {
    this.parent_model = "Post";
  }
  next();
});

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
