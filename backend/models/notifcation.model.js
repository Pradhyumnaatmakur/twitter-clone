import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    from: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["follow", "like"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);

export default Notification;
