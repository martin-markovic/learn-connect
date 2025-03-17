import { Router } from "express";
const examRoutes = Router();

import {
  getExam,
  getExamFeedback,
  finishExam,
} from "../../controller/quizzes/examController.js";
import { protect } from "../../middleware/authMiddleware.js";

examRoutes.post("/", protect, finishExam);
examRoutes.get("/", protect, getExam);
examRoutes.get("/feedback/:quizId", protect, getExamFeedback);

export default examRoutes;
