import { Router } from "express";
const notificationRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getNotifications,
  updateNotifications,
} from "../../controller/notifications/notificationController.js";

notificationRoutes.get("/:userId", protect, getNotifications);

notificationRoutes.patch("/:userId", protect, updateNotifications);
export default notificationRoutes;
