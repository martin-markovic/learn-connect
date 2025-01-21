import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Quiz",
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  examStart: {
    type: Data,
    default: Date.now(),
  },
  examFinish: {
    type: Date,
    required: true,
  },
  shuffledQuestions: {
    type: Array,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
    default: [],
  },
});

examSchema.pre("save", async function (next) {
  if (!this.isModified("examStart")) {
    return next();
  }

  const Quiz = mongoose.model("Quiz");
  const quiz = await Quiz.findById(this.quizId);

  if (!quiz) {
    return next(new Error("Quiz not found"));
  }

  this.examFinish = new Date(
    this.examStart.getTime() + quiz.timeLimit * 60 * 1000
  );
  next();
});

examSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Quiz = mongoose.model("Quiz");
    const quizFound = await Quiz.findById(this.quizId);

    if (!quizFound) {
      return next(new Error("Quiz not found"));
    }

    this.shuffledQuestions = quizFound.questions.map((question) => {
      return {
        ...question,
        choices: question.choices.sort(() => Math.random() - 0.5),
      };
    });
  }

  next();
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
