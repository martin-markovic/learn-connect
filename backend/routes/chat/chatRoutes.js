import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getMessages,
  updateMessageStatus,
  removeMessages,
} from "../../controller/chat/chatController.js";

chatRoutes
  .route("/:classroom/chat")
  .get(protect, getMessages)
  .delete(protect, removeMessages);

chatRoutes.patch("/:classroom/chat/:messageId", protect, updateMessageStatus);

export default chatRoutes;
