import { Router } from "express";
const examRoutes = Router();

import {
  getExam,
  getExamFeedback,
} from "../../controller/quizzes/examController.js";
import { protect } from "../../middleware/authMiddleware.js";

examRoutes.get("/", protect, getExam);
examRoutes.get("/:examId", protect, getExamFeedback);

export default examRoutes;
