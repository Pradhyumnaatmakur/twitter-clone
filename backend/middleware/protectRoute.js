import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies();
    if (!token) {
      return res.status(401).json({ message: "No Token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid Authorization" });
    }

    const user = User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error, "Error in protectRoute Middleware");
    return res.status(500).json({ message: "Server Error" });
  }
};