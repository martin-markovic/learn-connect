import mongoose from "mongoose";

const quizSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    question: {
      type: String,
      required: [true, "Please add a question"],
    },
    choices: {
      type: [String],
      required: [true, "Please add choices"],
    },
    answer: {
      type: String,
      required: [true, "Please add an answer"],
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
