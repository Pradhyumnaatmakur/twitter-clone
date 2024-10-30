import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (req.user._id.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to create post" });
    }

    const { text } = req.body;
    let { img } = req.body;

    if (!text && !img) {
      return res
        .status(400)
        .json({ message: "a post must contain image or text" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json({ message: "Post Created" });
  } catch (error) {
    console.error("ERROR IN createPost CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const user = await User.findById(userId);

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You Are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post Deleted" });
  } catch (error) {
    console.error("ERROR IN deletePost CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const likeUnlike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      //unlike
      await Post.findByIdAndUpdate(id, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likedPosts: id } });
      res.status(200).json({ message: "Post Unliked" });
    } else {
      //like
      await Post.findByIdAndUpdate(id, { $push: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $push: { likedPosts: id } });

      const newNotification = new Notification({
        to: id,
        from: userId,
        type: "follow",
      });

      await newNotification.save();
      res.status(200).json({ message: "Post Liked" });
    }

    await post.save();
  } catch (error) {
    console.error("ERROR IN likeUnlike CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const { id } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User Not Found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "PostNot Found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const comment = {
      user: userId,
      text,
    };

    await post.comments.push(comment);
    await post.save();
    res.status(200).json({ message: "comment success" });
  } catch (error) {
    console.error("ERROR IN commentOnPost CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "user.comments",
        select: "-password",
      });

    if (posts.length <= 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("ERROR IN getAllPosts CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404), json({ message: "User not found" });
    }

    const likedPosts = await User.find({ _id: { $in: user.likedPosts } });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("ERROR IN getLikedPosts CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const following = user.following;
    const followingPosts = await Post.find({
      user: { $in: following },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "user.comments", select: "-password" });

    res.status(200).json(followingPosts);
  } catch (error) {
    console.error("ERROR IN getFollowing CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.find({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userPosts = await Post.find({ user: user._id })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "user.comments", select: "-password" });

    res.status(200).json(userPosts);
  } catch (error) {
    console.error("ERROR IN getUserPosts CONTROLLER", error);
    res.status(200).json({ message: "Sever Error" });
  }
};
