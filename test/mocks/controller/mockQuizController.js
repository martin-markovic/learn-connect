import testDB from "../config/mockDatabase.js";

const createQuiz = (req, res) => {
  return res.status(201).json({ message: "createQuiz" });
};

const getQuizzes = (req, res) => {
  return res.status(200).json({ message: "getQuizzes" });
};

const getQuizById = (req, res) => {
  return res.status(200).json({ message: "getQuizById" });
};

const updateQuiz = (req, res) => {
  return res.status(200).json({ message: "updateQuiz" });
};

const deleteQuiz = (req, res) => {
  return res.status(200).json({ message: "deleteQuiz" });
};

export { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
