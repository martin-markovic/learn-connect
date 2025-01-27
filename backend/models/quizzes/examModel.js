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
    type: Date,
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
  isInProgress: {
    type: Boolean,
    default: true,
  },
});

examSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Quiz = mongoose.model("Quiz");
    const quizFound = await Quiz.findById(this.quizId);

    if (!quizFound) {
      return next(new Error("Quiz not found"));
    }

    this.shuffledQuestions = quizFound.questions.map((question) => {
      const choicesWithAnswer = [...question.choices, question.answer];
      const shuffledChoices = choicesWithAnswer.sort(() => Math.random() - 0.5);

      return {
        question: question.question,
        choices: shuffledChoices,
      };
    });
  }

  next();
});

const Exam = mongoose.model("Exam", examSchema);
export default Exam;
