import jwt from "jsonwebtoken";
import User from "../models/users/userModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (!decodedToken || !decodedToken.id) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = await User.findById(decodedToken.id);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
};
