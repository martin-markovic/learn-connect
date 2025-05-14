import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getChatStatus,
  getMessages,
} from "../../controller/chat/chatController.js";

chatRoutes.get("/", protect, getMessages);
chatRoutes.get("/status", protect, getChatStatus);

export default chatRoutes;
