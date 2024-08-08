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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
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
      res.status(400).json({ message: "Please add all fields" });
    }

    const user = await User.findOne({ email });

    if (user && bcrypt.compare(password, user.password)) {
      return res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
