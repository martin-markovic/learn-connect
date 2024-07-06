import testDB from "../config/mockDatabase.js";

const createQuiz = (req, res) => {
  if (
    !req.body.question ||
    !req.body.choices ||
    req.body.choices.length < 3 ||
    !req.body.answer
  ) {
    return res.status(400).json({
      message: "Please add all fields",
    });
  }

  const newQuiz = {
    user: req.user.id,
    question: req.body.question,
    choices: req.body.choices,
    answer: req.body.answer,
  };

  return res.status(201).json(newQuiz);
};

const getQuizzes = (req, res) => {
  const quizzesFound = testDB.find("quizzes", { id: parseInt(req.user.id) });

  return res.status(200).json({ quizzes: quizzesFound });
};

const getQuizById = (req, res) => {
  const quizFound = testDB.findOne("quizzes", { id: parseInt(req.params.id) });

  if (!quizFound) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (quizFound.id !== req.user.id) {
    return res.status(401).json({ message: "User not authorized" });
  }

  return res.status(200).json({
    user: req.user.id,
    question: quizFound.question,
    choices: quizFound.choices,
    answer: quizFound.answer,
  });
};

const updateQuiz = (req, res) => {
  const quizFound = testDB.findOne("quizzes", {
    id: parseInt(req.params.id),
  });

  if (!quizFound) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (quizFound.id !== req.user.id) {
    return res.status(401).json({ message: "Not authorized" });
  }

  return res.status(200).json({
    user: req.user.id,
    question: req.body.question,
    choices: req.body.choices,
    answer: req.body.answer,
  });
};

const deleteQuiz = (req, res) => {
  const quizFound = testDB.findOne("quizzes", { id: parseInt(req.params.id) });

  if (!quizFound) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  if (quizFound.id !== req.user.id) {
    return res.status(401).json({ message: "Not authorized" });
  }

  return res.status(200).json({ id: quizFound.id });
};

export { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
