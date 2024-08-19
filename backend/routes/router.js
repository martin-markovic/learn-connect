import { Router } from "express";
const router = Router();

import userRoutes from "../routes/users/userRoutes.js";
import quizRoutes from "./quizzes/quizRoutes.js";
import chatRoutes from "./chat/chatRoutes.js";
import classroomRoutes from "./classrooms/classroomRoutes.js";

router.use("/api/users", userRoutes);
router.use("/api/quizzes/", quizRoutes);
router.use("/api/chat", chatRoutes);
router.use("/api/classroom", classroomRoutes);

export default router;
