import { Router } from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../../controller/mockQuizController.js";

import { mockProtect } from "../../middleware/mockMiddleware.js";

const mockQuizRoutes = Router();

mockQuizRoutes.post("/", createQuiz);
mockQuizRoutes.get("/", getQuizzes);

mockQuizRoutes.get("/:id", getQuizById);

mockQuizRoutes.put("/:id", updateQuiz);
mockQuizRoutes.delete("/:id", deleteQuiz);

export default mockQuizRoutes;
