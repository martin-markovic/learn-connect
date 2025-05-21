import { Router } from "express";
const classroomRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  joinClassroom,
  leaveClassroom,
  getAllClassrooms,
  getUserClassroom,
} from "../../controller/classroom/classroomController.js";

classroomRoutes.post("/join/:classroomId", protect, joinClassroom);
classroomRoutes.post("/leave/:classroomId", protect, leaveClassroom);
classroomRoutes.get("/", protect, getAllClassrooms);
classroomRoutes.get("/me", protect, getUserClassroom);

export default classroomRoutes;
