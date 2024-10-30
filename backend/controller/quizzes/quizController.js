import Quiz from "../../models/quizzes/quizModel.js";
import User from "../../models/users/userModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, questions, timeLimit, classroomId } = req.body;

    if (
      !title ||
      !classroomId ||
      questions.length < 5 ||
      timeLimit < 3 ||
      timeLimit > 10
    ) {
      return res.status(400).json({
        message: "Please add all fields",
      });
    }

    const user = await User.findById(req.user.id).populate("classrooms");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const classroom = user.classrooms.find(
      (c) => c._id.toString() === classroomId
    );
    if (!classroom) {
      return res
        .status(403)
        .json({ message: "User not enrolled in the specified classroom" });
    }

    const classroomExists = await Classroom.findById(classroomId);
    if (!classroomExists) {
      return res.status(400).json({ message: "Classroom not found" });
    }

    const quiz = await Quiz.create({
      title,
      questions,
      timeLimit,
      user: req.user.id,
      classroom: classroomId,
    });

    return res.status(201).json(quiz);
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user });
    return res.status(200).json(quizzes);
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(400).json({ message: "quiz not found" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (quiz.user.toString() !== user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

export const getQuizzesByClassroom = async (req, res) => {
  const classroomId = req.params.classroomId;

  try {
    const quizzes = await Quiz.find({ classroom: classroomId });
    return res.json(quizzes);
  } catch (error) {
    console.error("Error in getQuizzesByClassroom:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const accessQuiz = async (req, res) => {
  const { quizId, userId } = req.params;
  try {
    const quiz = Quiz.findById(quizId).populate("classroom");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const user = User.findById(userId).populate("classroom");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isEnrolled = user.classrooms.some(
      (classroom) => classroom._id.toString() === quiz.classroom._id.toString()
    );

    if (!isEnrolled) {
      return res
        .status(403)
        .json({ message: "Please enroll in the required classroom" });
    }
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quizToUpdate = await Quiz.findById(req.params.id);

    if (!quizToUpdate) {
      return res.status(400).json({ message: "quiz not found" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = await User.findById(req.user.id);

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedQuiz) {
      return res.status(500).json({ message: "Failed to update quiz" });
    }

    if (quizToUpdate.user.toString() !== user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    return res.status(200).json(updatedQuiz);
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (quiz.user.toString() !== user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    return res.status(200).json({
      message: `quiz ${req.params.id} successfully deleted`,
      _id: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error.message}`,
    });
  }
};
