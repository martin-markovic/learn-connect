import Exam from "../../models/quizzes/examModel.js";

export const getExam = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const examFound = await Exam.findOne({ studentId: userId });

    if (!examFound) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json(examFound);
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

    const { examId } = req.params;

    if (!examId) {
      return res.status(400).json({ message: "Missing exam id" });
    }

    const examFound = await Exam.findOne({ _id: examId });

    if (!examFound) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json(examFound);
  } catch (error) {
    console.error(`Error fetching exam: ${error.message}`);
    return res.status(500).json({
      message: `Error fetching exam: ${error.message}`,
    });
  }
};
