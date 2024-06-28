import { Router } from "express";
const router = Router();

import userRoutes from "../routes/users/userRoutes.js";
import quizRoutes from "./quizzes/quizRoutes.js";

router.use("/api/users", userRoutes);
router.use("/api/quizzes/", quizRoutes);

export default router;
