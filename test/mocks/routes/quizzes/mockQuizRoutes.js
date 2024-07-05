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

mockQuizRoutes.post("/", mockProtect, createQuiz);
mockQuizRoutes.get("/", mockProtect, getQuizzes);

mockQuizRoutes.get("/:id", mockProtect, getQuizById);

mockQuizRoutes.put("/:id", mockProtect, updateQuiz);
mockQuizRoutes.delete("/:id", mockProtect, deleteQuiz);

export default mockQuizRoutes;
