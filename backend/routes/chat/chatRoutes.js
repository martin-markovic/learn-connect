import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getUserMessages,
  getClassroomMessages,
  sendMessage,
} from "../../controller/chat/chatController.js";

chatRoutes.get("/messages/:id", protect, getUserMessages);

chatRoutes
  .get(protect, getClassroomMessages);
  .route("/:classroom/chat")
  .post(protect, sendMessage)

export default chatRoutes;
