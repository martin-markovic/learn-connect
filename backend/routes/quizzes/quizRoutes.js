import { Router } from "express";
const quizRoutes = Router();

import {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../controller/quizzes/quizController.js";

quizRoutes.route("/").post(createQuiz).get(getAllQuizzes);
quizRoutes.route("/:id").get(getQuiz).put(updateQuiz).delete(deleteQuiz);

export default quizRoutes;
