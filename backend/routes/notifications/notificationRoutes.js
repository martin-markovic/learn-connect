import { Router } from "express";
const notificationRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import {
  getNotifications,
  updateNotification,
  updateNotifications,
} from "../../controller/notifications/notificationController.js";

notificationRoutes.get("/:userId", protect, getNotifications);

notificationRoutes.patch("/:userId", protect, updateNotifications);

notificationRoutes.patch(
  "/:userId/:notificationId",
  protect,
  updateNotification
);

export default notificationRoutes;
