import { Router } from "express";
const quizRoutes = Router();

import {
  getUserQuizzes,
  getClassroomQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../../controller/quizzes/quizController.js";
import { protect } from "../../middleware/authMiddleware.js";

import User from "../../models/users/userModel.js";
import Quiz from "../../models/quizzes/quizModel.js";

const handleGetUserQuizzes = getUserQuizzes(User, Quiz);
const handleGetClassQuizzes = getClassroomQuizzes(User, Quiz);
const handleUpdateQuiz = updateQuiz(User, Quiz);
const handleDeleteQuiz = deleteQuiz(User, Quiz);

quizRoutes.get("/", protect, handleGetUserQuizzes);
quizRoutes
  .route("/:id")
  .put(protect, updateQuiz)
  .delete(protect, handleDeleteQuiz);

quizRoutes.get("/classroom", protect, handleGetClassQuizzes);

export default quizRoutes;
