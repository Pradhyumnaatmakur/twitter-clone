import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollow,
  getSuggested,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/profile/:username", getUserProfile);
router.get("/suggested", getSuggested);
router.post("/follow/:id", followUnfollow);
router.post("/update/", updateUser);

export default router;
