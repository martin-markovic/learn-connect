import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  highScore: {
    type: Number,
    default: 0,
  },
  examFeedback: {
    type: Array,
    default: [],
  },
});

const Score = mongoose.model("Score", scoreSchema);
export default Score;
