import express, { urlencoded } from "express";
import authRoutes from "./routes/auth.routes.js";
import { configDotenv } from "dotenv";
import { connectDB } from "./db/connetDB.js";
import cookieParser from "cookie-parser";

configDotenv();
const app = express();
const PORT = process.env.PORT || 5000;

// a lot of middleware to parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
  connectDB();
});
