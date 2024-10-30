import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  getAllNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getAllNotifications);
router.delete("/", deleteNotifications);

export default router;
