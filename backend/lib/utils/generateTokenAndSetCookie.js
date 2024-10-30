import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  try {
    if (!userId || !res) {
      throw new Error("Missing Parameters");
    }
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });
  } catch (error) {
    console.error("ERROR IN GENERATETOKEN", error);
    throw new Error("Failed to generate token");
  }
};
