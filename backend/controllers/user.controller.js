import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async () => {
  const { username } = req.params;
  try {
    const user = User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error, "Error In getUserProfile Controller");
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    //get user ID
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(error, "Error In getSuggestedUsers Controller");
    res.status(500).json({ message: "Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  //take id from req.params
  const { id } = req.params;
  try {
    // take user to modify and current User
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    //cant unfollow/ follow ourself
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cant follow and unfollow yourself" });
    }

    //check if not found

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User Not Found" });
    }

    //check if follow it should unfollow and if not following then it should follow
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); //unfollow the user and update the followers array
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); //unfollow the user and update the fol lowing array
      return res.status(200).json({ message: "User unfollowed Successfully" });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); //follow and update the followers array
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // follow and update the following array

      //send notification from notfication model
      const newNotification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: "follow",
      });

      await newNotification.save();
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error(error, "Error In followUnfollowUser Controller");
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        message: "Please Provide Both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current Password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "password should be more than 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split("")[0]
        );
      }
      const uploadres = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadres.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split("")[0]
        );
      }
      const uploadres = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadres.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.error(error, "Error in updateUserProfile");
    res.status(500).json({ message: "Server Error" });
  }
};
