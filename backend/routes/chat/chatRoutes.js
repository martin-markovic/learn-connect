import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  sendFriendMessage,
  sendClassroomMessage,
  getUserMessages,
  getClassroomMessages,
  getClassrooms,
  joinClassroom,
  leaveClassroom,
} from "../../controller/chat/chatController.js";

chatRoutes
  .route("/")
  // .post(protect, sendFriendMessage)
  .get(protect, getUserMessages);

// chatRoutes.route("/classroom/:id").post(protect, sendClassroomMessage);

// chatRoutes
//   .route("/classroom/:id/messages")
//   .post(protect, sendClassroomMessage)
//   .get(protect, getClassroomMessages);

chatRoutes.post("/classroom/join", protect, joinClassroom);
// chatRoutes.post("/classroom/leave", protect, leaveClassroom);

chatRoutes.route("/classrooms").get(protect, getClassrooms);

export default chatRoutes;
