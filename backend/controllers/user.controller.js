import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notifcation.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("ERROR IN getUserProfile CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSuggested = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isFollowing = user.following;

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
          _id: { $nin: user.following },
        },
      },
      {
        $sort: { followers: -1 },
      },
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error("ERROR IN getSuggested CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    if (id === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cant follow/unfollow yourself" });
    }

    const currentUser = await User.findById(userId);
    const userToFollow = await User.findById(id);

    if (!currentUser || !userToFollow) {
      return res.status(200).json({ message: "User Not Found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { following: id } }
      );
      await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { followers: userId } }
      );
      res.status(200).json({ message: "Unfollowed" });
    } else {
      //follow
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { following: id } }
      );
      await User.findByIdAndUpdate(
        { _id: id },
        { $push: { followers: userId } }
      );
      const newNotification = new Notification({
        to: id,
        from: userId,
        type: "follow",
      });

      await newNotification.save();
      res.status(200).json({ message: "Followed" });
    }
  } catch (error) {
    console.error("ERROR IN followUnfollow CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    let {
      username,
      fullName,
      email,
      currentPassword,
      newPassword,
      bio,
      link,
      profileImg,
      coverImg,
    } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      return res.status(400).json({ message: "This username already exists" });
    }

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });

    if (existingEmail) {
      return res.status(400).json({ message: "This email already exists" });
    }
    if (!currentPassword && !newPassword) {
      return res.status(400).json({ message: "Enter both passwords" });
    }

    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current Password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      newPassword = hashedPassword;
    }

    if (profileImg) {
      if (user.profileImg) {
        const imgId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const imgId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.password = newPassword || user.password;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    user.password = null;
    res.status(200).json({ message: "Updated", user });
  } catch (error) {
    console.error("ERROR IN updateUser CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
