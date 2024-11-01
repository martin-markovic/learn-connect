import { Router } from "express";
const notificationRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import { getNotifications } from "../../controller/notifications/notificationController.js";

notificationRoutes.get("/:userId", protect, getNotifications);

export default notificationRoutes;
