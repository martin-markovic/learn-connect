import mongoose from "mongoose";

const quizScoreSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  highScore: {
    type: Number,
    required: true,
  },
  timeCompleted: {
    type: Number,
    required: true,
  },
  bestTimeCompleted: {
    type: Number,
    required: true,
  },
});

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
  classrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
    },
  ],
  quizScoreSchema: [quizScoreSchema],
});

const User = mongoose.model("User", userSchema);
export default User;
