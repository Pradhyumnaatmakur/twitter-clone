import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
