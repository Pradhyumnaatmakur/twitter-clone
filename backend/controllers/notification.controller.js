import Notification from "../models/notifcation.model.js";

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "profileImg, username",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("ERROR IN getAllNotifications CONTROLLER", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  const userId = req.user._id;

  await Notification.deleteMany({ to: userId });

  res.status(200).json({ message: "All Notifications Deleted" });
};
