import { Router } from "express";
const quizRoutes = Router();

import {
  getUserQuizzes,
  getQuizzesByClassroom,
  getQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../controller/quizzes/quizController.js";
import { protect } from "../../middleware/authMiddleware.js";

quizRoutes.get("/", protect, getUserQuizzes);
quizRoutes
  .route("/:id")
  .get(protect, getQuiz)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

quizRoutes.get("/:classroomId", getQuizzesByClassroom);

export default quizRoutes;
