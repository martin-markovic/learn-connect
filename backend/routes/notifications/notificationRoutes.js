import { Router } from "express";
const notificationRoutes = Router();

import { protect } from "../../middleware/authMiddleware.js";
import { getNotifications } from "../../controller/notifications/notificationController.js";

import Notification from "../../models/users/notificationModel.js";

const handleGetNotifications = getNotifications(Notification);

notificationRoutes.get("/:userId", protect, handleGetNotifications);

export default notificationRoutes;
