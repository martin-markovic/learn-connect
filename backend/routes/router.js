import { Router } from "express";
const router = Router();

import userRoutes from "../routes/users/userRoutes.js";
import quizRoutes from "./quizzes/quizRoutes.js";
import chatRoutes from "./chat/chatRoutes.js";
import classroomRoutes from "./classrooms/classroomRoutes.js";
import notificationRoutes from "./notifications/notificationRoutes.js";
import friendRouter from "./users/friendRoutes.js";
import examRoutes from "./quizzes/examRoutes.js";

router.use("/api/users", userRoutes);
router.use("/api/quizzes/", quizRoutes);
router.use("/api/chat", chatRoutes);
router.use("/api/classroom", classroomRoutes);
router.use("/api/notifications", notificationRoutes);
router.use("/api/friends", friendRouter);
router.use("/api/exam", examRoutes);

export default router;
