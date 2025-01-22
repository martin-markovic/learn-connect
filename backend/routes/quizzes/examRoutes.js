import { Router } from "express";
const examRoutes = Router();

import {
  createExam,
  getExam,
} from "../../controller/quizzes/examController.js";
import { protect } from "../../middleware/authMiddleware.js";

examRoutes.post("/", protect, createExam);
examRoutes.get("/", protect, getExam);

export default examRoutes;
