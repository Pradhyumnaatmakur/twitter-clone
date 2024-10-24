import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    //email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Provide a vaild email" });
    }

    //username validation
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    //email validation

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //password validation

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password Must at least 6 characters long" });
    }

    //hash password using bcrypt

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // save user

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      await newUser.save();

      res.status(201).json({
        user: {
          _id: newUser._id,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          followers: newUser.followers,
          following: newUser.following,
          profileImg: newUser.profileImg,
          coverImg: newUser.coverImg,
        },
        message: "User Created",
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Sever Error" });
  }
};

export const login = async (req, res) => {
  //initiate

  const { username, password } = req.body;

  //validate

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  //find user

  const user = await User.findOne({ username });

  //check user
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // verify password

  const isPassword = await bcrypt.compare(password, user.password);

  //check password
  if (!isPassword) {
    return res.status(400).json({ message: "Invalid Username or Password" });
  }

  //generateToken

  generateTokenAndSetCookie(user._id, res);

  res.status(200).json({ message: "Logged In" });
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    console.error(error, "ERROR IN LOGOUT CONTROLLER");
  }
};

export const getMe = async (req, res) => {
  try {
    const user = User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error(error, "Error in getMe auth controller");
    res.status(500).json({ message: "Internal Server Error" });
  }
};
