import express, { urlencoded } from "express";
import authRoutes from "./routes/auth.route.js";
import { configDotenv } from "dotenv";
import { connectDB } from "./db/connetDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import { v2 as cloudinary } from "cloudinary";

configDotenv();
const app = express();
const PORT = process.env.PORT || 5000;

// a lot of middleware to parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//routes

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
  connectDB();
});
