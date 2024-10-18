import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { configDotenv } from "dotenv";
import { connectDB } from "./db/connetDB.js";

configDotenv();
const app = express();

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
  connectDB();
});
