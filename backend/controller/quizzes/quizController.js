import Quiz from "../../models/quizzes/quizModel.js";
import User from "../../models/users/userModel.js";

export const createQuiz = async (req, res) => {
  try {
    const { question, answer, choices } = req.body;

    if (!question || !answer || !choices || choices.length < 3) {
      return res.status(400).json({
        message: "Please add all fields",
      });
    }

    const quiz = await Quiz.create({
      question,
      answer,
      choices,
      user: req.user.id,
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
