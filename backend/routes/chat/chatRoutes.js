import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  sendFriendMessage,
  sendClassroomMessage,
  getClassroomMessages,
  getUserMessages,
} from "../../controller/chat/chatController.js";

chatRoutes
  .route("/")
  .post(protect, sendFriendMessage)
  .get(protect, getUserMessages);
chatRoutes
  .route("/:id")
  .post(protect, sendClassroomMessage)
  .get(protect, getClassroomMessages);

export default chatRoutes;
