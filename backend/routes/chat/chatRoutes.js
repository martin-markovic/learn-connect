import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  removeMessages,
} from "../../controller/chat/chatController.js";

chatRoutes
  .route("/:classroom/chat")
  .post(protect, sendMessage)
  .get(protect, getMessages)
  .delete(protect, removeMessages);

export default chatRoutes;
