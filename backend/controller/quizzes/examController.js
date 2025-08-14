import mongoose from "mongoose";

export const getExam = (Exam) => async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
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
    console.error(`Error fetching exam: ${error.message || "Server error"}`);
    return res.status(error.statusCode || 500).json({
      message: `Error fetching exam: ${error.message || "Server error"}`,
    });
  }
};

export const getExamFeedback = (Score) => async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
    }

    const { quizId } = req.params;

    if (!quizId) {
      throw { statusCode: 400, message: "Missing quiz id" };
    }

    const scoreFound = await Score.findOne({
      "quiz.quizId": new mongoose.Types.ObjectId(quizId),
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!scoreFound) {
      throw { statusCode: 404, message: "Exam score not found" };
    }

    return res.status(200).json(scoreFound);
  } catch (error) {
    console.error(
      `Error fetching exam feedback: ${error.message || "Server error"}`
    );
    return res.status(error.statusCode || 500).json({
      message: `Error fetching exam feedback: ${
        error.message || "Server error"
      }`,
    });
  }
};

export const getExamScores = (Score) => async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
    }

    const { friendId } = req.params;

    if (!friendId) {
      throw { statusCode: 403, message: "Unindentified friend ID" };
    }

    const examScores = await Score.find({ user: friendId }).select(
      "-user -examFeedback -__v"
    );

    return res.status(200).json({ friendId, scoreList: examScores || [] });
  } catch (error) {
    console.error(
      "Error fetching exam scores",
      error.message || "Server error"
    );
    return res.status(error.statusCode || 500).json({
      message: `Error fetching exam scores: ${error.message || "Server error"}`,
    });
  }
};
