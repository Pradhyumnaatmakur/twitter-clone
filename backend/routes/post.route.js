import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlike,
} from "../controllers/post.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/user/:username", getUserPosts);
router.get("/likes/:id", getLikedPosts);
router.get("all", getAllPosts);
router.post("/create", createPost);
router.post("/like/:id", likeUnlike);
router.post("/comment/:id", commentOnPost);
router.delete("/:id", deletePost);

export default router;
