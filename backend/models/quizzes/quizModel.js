import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please add a question"],
  },
  choices: {
    type: [String],
    required: [true, "Please add choices"],
    validate: {
      validator: function (v) {
        return v.length === 3;
      },
      message: "Please provide 3 choices",
    },
  },
  answer: {
    type: String,
    required: [true, "Please add an answer"],
  },
});

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

const quizSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 5 && v.length <= 20;
        },
        message: "Please provide between 5 and 20 questions",
      },
    },
    timeLimit: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 3 && v <= 10;
        },
        message: "Please provide a valid time limit (between 3 and 10 minutes",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
