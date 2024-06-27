import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add your name"],
  },
  email: {
    type: String,
    required: [true, "Please add your email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add your password"],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
