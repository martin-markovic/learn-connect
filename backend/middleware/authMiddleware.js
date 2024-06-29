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

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decodedToken.id);

      next();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};
