import { Router } from "express";
const quizRoutes = Router();

import {
  getAllQuizzes,
  getQuizzesByClassroom,
  getQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../controller/quizzes/quizController.js";
import { protect } from "../../middleware/authMiddleware.js";

quizRoutes.get("/", protect, getAllQuizzes);
quizRoutes
  .route("/:id")
  .get(protect, getQuiz)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

quizRoutes.get("/:classroomId", getQuizzesByClassroom);
export default quizRoutes;
