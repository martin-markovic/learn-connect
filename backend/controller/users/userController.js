import User from "../../models/users/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// POST users api/users/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;

    if (!name || !email || !password || !password2) {
      throw { statusCode: 400, message: "Please add all fields" };
    }

    if (password !== password2) {
      throw { statusCode: 400, message: "Passwords must match" };
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw { statusCode: 400, message: "Email already registered" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error registering user", error.message);
    return res
      .status(error?.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};

// POST user api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw {
        statusCode: 400,
        message: "Both email and password are required to log in",
      };
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw { statusCode: 404, message: "User not registered" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw { statusCode: 400, message: "Invalid password" };
    }

    return res.status(200).json({
      _id: user?.id,
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
      token: generateToken(user?._id),
    });
  } catch (error) {
    console.error("Error loggin in", error.message);
    return res
      .status(error?.statusCode || 500)
      .json({ message: error.message || "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw { statusCode: 403, message: "Authentication required" };
    }

    const avatarUrl = req.file?.path || null;

    const { name, email, password, avatar } = req.body;

    const updateFields = { name, email, password, avatar };

    if (avatarUrl) {
      updateFields.avatar = avatarUrl;
    }

    const cleanedFields = Object.entries(updateFields).reduce(
      (acc, [key, value]) => {
        if (key === "avatar" && value === "removeAvatar") {
          acc[key] = null;
        } else if (value != null && value !== "null" && value !== "")
          acc[key] = value;
        return acc;
      },
      {}
    );

    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw { statusCode: 409, message: "Email already in use" };
      }
    }

    const updatedData = await User.findByIdAndUpdate(userId, cleanedFields, {
      new: true,
      runValidators: true,
    }).select("-password -online -__v");

    if (!updatedData) {
      throw { statusCode: 404, message: "User not found" };
    }

    return res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating user profile: ", error.message);
    return res
      .status(error?.statusCode || 500)
      .json({ message: error?.message || "Server error" });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
