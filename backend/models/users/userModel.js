import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add your name"],
    trim: true,
    minLength: [2, "Name must be at least 2 characters long"],
    validate: {
      validator: (v) => v !== "null",
      message: "Name cannot be 'null'",
    },
  },
  email: {
    type: String,
    required: [true, "Please add your email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    validate: {
      validator: (v) => v !== "null",
      message: "Email cannot be 'null'",
    },
  },
  password: {
    type: String,
    required: [true, "Please add your password"],
    trim: true,
    minLength: [6, "Password must be at least 6 characters long"],
    validate: {
      validator: (v) => v !== "null",
      message: "Password cannot be 'null'",
    },
  },
  avatar: { type: String },
  classrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
    },
  ],
  online: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
