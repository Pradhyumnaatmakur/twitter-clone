import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);
    console.log(`CONNECTED TO DB`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
