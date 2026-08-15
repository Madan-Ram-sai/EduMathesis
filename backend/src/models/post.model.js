import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
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
    type: {
      type: String,
      enum: ["announcement", "doubt", "general"],
      required: true,
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

postSchema.plugin(mongooseAggregatePaginate);

export const Post = mongoose.model("Post", postSchema);
