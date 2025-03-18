import mongoose from "mongoose";
import Exam from "../../models/quizzes/examModel.js";
import Score from "../../models/quizzes/scoreModel.js";
import Quiz from "../../models/quizzes/quizModel.js";

export const getExam = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const examFound = await Exam.findOne({
      studentId: userId.toString(),
      isInProgress: true,
    });

    return res.status(200).json(examFound || {});
  } catch (error) {
    console.error(`Error fetching exam: ${error.message}`);
    return res.status(500).json({
      message: `Error fetching exam: ${error.message}`,
    });
  }
};

export const getExamFeedback = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ message: "Missing quiz id" });
    }

    const scoreFound = await Score.findOne({
      quiz: new mongoose.Types.ObjectId(quizId),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!scoreFound) {
      return res.status(404).json({ message: "Exam score not found" });
    }

    return res.status(200).json(scoreFound);
  } catch (error) {
    console.error(`Error fetching exam feedback: ${error.message}`);
    return res.status(500).json({
      message: `Error fetching exam feedback: ${error.message}`,
    });
  }
};

export const finishExam = async (req, res) => {
  try {
    const userId = req.user?._id;

    const { quizId } = req.body;

    const examFound = await Exam.findOne({ studentId: userId });

    if (!examFound) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const examQuestions = examFound?.shuffledQuestions;

    const examIsValid = examFound?.examFinish?.getTime() - Date.now();

    if (!examIsValid) {
      return res.status(400).json({ message: "Exam has expired" });
    }

    await Exam.findByIdAndUpdate(
      examFound?._id,
      { isInProgress: false },
      { new: true }
    );

    const quizFound = await Quiz.findOne({ _id: quizId });

    if (!quizFound) {
      return res
        .status(404)
        .json({ message: "Cannot evaluate exam, no matching quiz found" });
    }

    let currentScore = 0;

    let userChoices = [];

    for (let i = 0; i < quizFound.questions.length; i++) {
      const q = quizFound.questions[i];

      if (q.answer === examFound.answers[i]) {
        currentScore += 1;
      }

      userChoices[i] = {
        userAnswer: examFound?.answers?.[i],
        correctAnswer: q.answer,
      };
    }

    const scoreFound = await Score.findOne({
      user: userId,
      quiz: quizFound?._id,
    });

    let scorePayload;

    if (scoreFound) {
      const updatedScore = await Score.findByIdAndUpdate(
        scoreFound?._id,
        {
          $set: {
            "examFeedback.userChoices": userChoices,
            "examFeedback.randomizedQuestions": examQuestions,
            highScore: Math.max(scoreFound.highScore, currentScore),
            latestScore: currentScore,
          },
        },
        { new: true }
      );

      scorePayload = updatedScore;
    } else {
      const newScore = new Score({
        user: userId,
        quiz: quizFound?._id,
        examFeedback: {
          userChoices,
          randomizedQuestions: examQuestions,
        },
        highScore: currentScore,
        latestScore: currentScore,
      });

      const updatedScore = await newScore.save();
      scorePayload = updatedScore;
    }

    const examPayload = { examId: examFound?._id, scorePayload };

    await Exam.findByIdAndDelete({ _id: examFound?._id });

    res.status(200).json(examPayload);
  } catch (error) {
    console.error(`Error fetching exam feedback: ${error.message}`);
    return res.status(500).json({
      message: `Error finishing exam: ${error.message}`,
    });
  }
};
