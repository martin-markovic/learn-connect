import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  sendFriendMessage,
  sendClassroomMessage,
  getUserMessages,
  getClassroomMessages,
} from "../../controller/chat/chatController.js";

chatRoutes.post("/", protect, sendFriendMessage);
chatRoutes.get("/messages/:id", protect, getUserMessages);

chatRoutes
  .route("/messages/classroom/:id/")
  .post(protect, sendClassroomMessage)
  .get(protect, getClassroomMessages);


export default chatRoutes;
