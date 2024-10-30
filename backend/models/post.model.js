import mongoose, { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    img: {
      type: String,
    },
    text: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = model("Post", postSchema);

export default Post;
