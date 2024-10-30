import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;

    if (!username || !fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({ message: "username already exists" });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "email already exists" });
    }

    const valEmail = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;

    if (!valEmail.test(email)) {
      return res.status(400).json({ message: "enter a valid email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password should be more than 6 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      message: "signup success",
      newUser: {
        username,
        fullName,
        email,
      },
    });
  } catch (error) {
    console.error("ERROR IN signup CONTROLLER");
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username && !password) {
      return res.status(400).json({ message: "Enter Both fields" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({ message: "Logged In" });
  } catch (error) {
    console.error("ERROR IN login CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    console.error("ERROR IN logout CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("ERROR IN getMe CONTROLLER", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
