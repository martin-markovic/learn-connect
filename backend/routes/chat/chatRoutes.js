import { Router } from "express";
const chatRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import { getMessages } from "../../controller/chat/chatController.js";

chatRoutes.route("/").get(protect, getMessages);

export default chatRoutes;
