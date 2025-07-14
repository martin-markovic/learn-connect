import jwt from "jsonwebtoken";
import User from "../models/users/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      console.error("Missing or invalid auth header");

      throw { status: 400, message: "Login required to access this resource." };
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.error("Token not provided");

      throw { status: 400, message: "Authentication failed. Please relog." };
    }

    const { tokenValid, errorStatus, errorMessage } = decodeToken(token);

    if (!tokenValid) {
      throw {
        status: errorStatus || 401,
        message: errorMessage || "Session expired. Please log in.",
      };
    }

    req.user = await User.findById(tokenValid?.id);

    if (!req.user) {
      console.error("User not found in the database");

      throw { status: 401, message: "Your account could not be verified." };
    }

    next();
  } catch (error) {
    console.error("Error authorizing request: ", error.message);

    return res
      .status(error.status || 500)
      .json({ message: error.message || "Server error" });
  }
};

const decodeToken = (token) => {
  try {
    const tokenValid = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenValid || !tokenValid.id) {
      console.error("Invalid token");

      return {
        tokenValid: null,
        errorStatus: 400,
        errorMessage: "Session expired. Please log in again.",
      };
    }

    return { tokenValid };
  } catch (error) {
    console.error("JWT verification failed:", error.message);

    if (error.message === "jwt malformed") {
      return {
        tokenValid: null,
        errorStatus: 400,
        errorMessage: "Malformed token. Please log in again.",
      };
    } else if (error.message === "invalid token") {
      return {
        tokenValid: null,
        errorStatus: 401,
        errorMessage: "Invalid token. Session not recognized.",
      };
    } else if (error.message === "jwt expired") {
      return {
        tokenValid: null,
        errorStatus: 401,
        errorMessage: "Session expired. Please log in again.",
      };
    }

    return {
      tokenValid: null,
      errorStatus: error.status || 500,
      errorMessage: error.message || "Authentication failed. Please log in.",
    };
  }
};
