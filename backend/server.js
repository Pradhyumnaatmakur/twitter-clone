import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/db.js";

//import routes

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 2000;

//middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);

app.listen(PORT, () => {
  console.log(`SERVER ON ${PORT}`);
  connectDB();
});
