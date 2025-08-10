import { Router } from "express";
const classroomRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  joinClassroom,
  leaveClassroom,
  getAllClassrooms,
  getUserClassroom,
} from "../../controller/classroom/classroomController.js";

import User from "../../models/users/userModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

const handleJoinClassrom = joinClassroom(Classroom, User);
const handlelLeaveClassroom = leaveClassroom(Classroom, User);
const handleGetAllClassrooms = getAllClassrooms(Classroom);
const handleGetUserClassroom = getUserClassroom(Classroom);

classroomRoutes.post("/join/:classroomId", protect, handleJoinClassrom);
classroomRoutes.post("/leave/:classroomId", protect, handlelLeaveClassroom);
classroomRoutes.get("/", protect, handleGetAllClassrooms);
classroomRoutes.get("/me", protect, handleGetUserClassroom);

export default classroomRoutes;
