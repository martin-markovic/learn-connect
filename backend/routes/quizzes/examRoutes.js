import { Router } from "express";
const examRoutes = Router();

import {
  getExam,
  getExamFeedback,
  getExamScores,
} from "../../controller/quizzes/examController.js";
import { protect } from "../../middleware/authMiddleware.js";

import Exam from "../../models/quizzes/examModel.js";
import Score from "../../models/quizzes/scoreModel.js";

const handleGetExam = getExam(Exam);
const handleGetExamFeedback = getExamFeedback(Score);
const handleGetExamScores = getExamScores(Score);

examRoutes.get("/", protect, handleGetExam);
examRoutes.get("/feedback/:quizId", protect, handleGetExamFeedback);
examRoutes.get("/scores/:friendId", protect, handleGetExamScores);

export default examRoutes;
