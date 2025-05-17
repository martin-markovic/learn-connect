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
        throw new Error("No token provided");
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      if (!decodedToken || !decodedToken.id) {
        throw new Error("Invalid token");
      }

      req.user = await User.findById(decodedToken?.id);

      if (!req.user) {
        throw new Error("User not found in the database");
      }

      next();
    } catch (error) {
      console.error("Error authorizing request: ", error.message);
      return res.status(401).json({ message: error.message });
    }
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
};
