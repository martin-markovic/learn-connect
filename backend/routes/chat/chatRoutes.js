import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getChatStatus,
  getMessages,
} from "../../controller/chat/chatController.js";

import Chat from "../../models/chat/chatModel.js";
import User from "../../models/users/userModel.js";

const handleGetMessages = getMessages(Chat);
const handleGetChatStatus = getChatStatus(User);

chatRoutes.get("/", protect, handleGetMessages);
chatRoutes.get("/status", protect, handleGetChatStatus);

export default chatRoutes;
