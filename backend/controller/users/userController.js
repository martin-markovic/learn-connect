import User from "../../models/users/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// POST users api/users/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;

    if (!name || !email || !password || !password2) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    if (password !== password2) {
      return res.status(400).json({ message: "Passwords must match" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = req.file?.path || null;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    });

    if (user) {
      return res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error registering user", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST user api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password, user.password)) {
      return res.status(200).json({
        _id: user?.id,
        name: user?.name,
        email: user?.email,
        avatar: user?.avatar,
        token: generateToken(user?._id),
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(403).json({ message: "User id is required" });
    }

    const avatarUrl = req.file?.path || null;

    const { name, email, password } = req.body;

    const updateFields = { name, email, password, avatar: avatarUrl };

    const cleanedFields = Object.entries(updateFields).reduce(
      (acc, [key, value]) => {
        if (value != null && value !== "null" && value !== "") acc[key] = value;
        return acc;
      },
      {}
    );

    if (email) {
      const existingUser = await User.findOne({ email });

      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const updatedData = await User.findByIdAndUpdate(userId, cleanedFields, {
      new: true,
      runValidators: true,
    }).select("-password -online -__v");

    if (!updatedData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedData);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
