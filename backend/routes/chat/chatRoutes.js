import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  sendFriendMessage,
  sendClassroomMessage,
  getUserMessages,
  getClassroomMessages,
} from "../../controller/chat/chatController.js";

chatRoutes
  .route("/")
  // .post(protect, sendFriendMessage)
  .get(protect, getUserMessages);

// chatRoutes.route("/classroom/:id").post(protect, sendClassroomMessage);



export default chatRoutes;
