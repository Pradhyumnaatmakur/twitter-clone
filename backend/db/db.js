import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("CONNECTED TO DB @", conn.connection.host);
  } catch (error) {
    console.error("ERROR IN CONNECTING DB", error);
    process.exit(1);
  }
};
