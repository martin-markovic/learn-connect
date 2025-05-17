import Classroom from "../../models/classrooms/classroomModel.js";
import Quiz from "../../models/quizzes/quizModel.js";
import User from "../../models/users/userModel.js";

export const getUserQuizzes = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFound = User.findById(userId);

    if (!userFound) {
      return res.status(403).json({ message: "User is not registered" });
    }

    const quizzes = await Quiz.find({ createdBy: userId });

    return res.status(200).json(quizzes || []);
  } catch (error) {
    console.error(
      `Error fetching quizzes for ${req.user._id}:  ${error.message}`
    );

    return res.status(500).json({
      message: `Error fetching quizzes for ${req.user._id}: ${error.message}`,
    });
  }
};

export const getClassroomQuizzes = async (req, res) => {
  try {
    const userId = req.user?._id;

    const userFound = await User.findById(userId);

    if (!userFound) {
      return res.status(403).json({ message: "User is not registered" });
    }

    const userClassrooms = userFound?.classrooms;

    if (!userClassrooms.length) {
      return res.status(200).json([]);
    }

    const classroomIds = userClassrooms.map((classroom) => classroom._id);

    const quizPayload = await Quiz.find({ classroom: { $in: classroomIds } });

    return res.json(quizPayload || []);
  } catch (error) {
    console.error("Error in getQuizzesByClassroom:", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quizToUpdate = await Quiz.findById(req.params.id);

    if (!quizToUpdate) {
      return res.status(400).json({ message: "quiz not found" });
    }

    if (!req.user) {
      return res.status(403).json({ message: "User id is required" });
    }

    const user = await User.findById(req.user.id);

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedQuiz) {
      return res.status(500).json({ message: "Failed to update quiz" });
    }

    if (quizToUpdate.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Access denied, quiz does not belong to this user" });
    }

    return res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error(`Error updating quiz ${req.params.id}: ${error.message}`);

    return res.status(500).json({
      message: `Error updating quiz ${req.params.id}: ${error.message}`,
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(403).json({ message: "User is not registered" });
    }

    if (quiz.user.toString() !== user?.id) {
      return res
        .status(403)
        .json({ message: "Access denied, quiz does not belong to this user" });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      message: `quiz ${req.params.id} successfully deleted`,
      _id: req.params.id,
    });
  } catch (error) {
    console.error(`Error deleting quiz ${req.params.id}: ${error.message}`);

    return res.status(500).json({
      message: `Error deleting quiz ${req.params.id}: ${error.message}`,
    });
  }
};
