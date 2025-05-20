import mongoose from "mongoose";
import Exam from "../../models/quizzes/examModel.js";
import Score from "../../models/quizzes/scoreModel.js";

export const getExam = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(403).json({ message: "User id is required" });
    }

    const examFound = await Exam.findOne({
      studentId: userId.toString(),
      isInProgress: true,
    });

    const examIsValid = examFound?.examFinish?.getTime() - Date.now() > 0;

    if (!examIsValid) {
      await Exam.findByIdAndDelete(examFound?._id);

      return res.status(200).json({});
    }

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
      return res.status(403).json({ message: "User id is required" });
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

export const getExamScores = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new Error({ statusCode: 403, message: "User id is required" });
    }

    const examScores = await Score.find({ user: userId })
      .select("-user -examFeedback -__v")
      .populate({
        path: "quiz",
        select:
          "-createdBy -classroom -questions -timeLimit -createdAt -updatedAt -__v",
      });

    return res.status(200).json(examScores || []);
  } catch (error) {
    console.error("Error fetching exam scores", error.message);
    return res.status(error.statusCode || 500).json({
      message: `Error fetching exam scores: ${error.message || "Server error"}`,
    });
  }
};
