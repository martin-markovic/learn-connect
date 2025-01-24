import { Router } from "express";
const quizRoutes = Router();

import {
  getUserQuizzes,
  getClassroomQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../../controller/quizzes/quizController.js";
import { protect } from "../../middleware/authMiddleware.js";

quizRoutes.get("/", protect, getUserQuizzes);
quizRoutes.route("/:id").put(protect, updateQuiz).delete(protect, deleteQuiz);

quizRoutes.get("/:classroomId", getClassroomQuizzes);

export default quizRoutes;
