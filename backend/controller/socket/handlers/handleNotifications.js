import Quiz from "../../../models/quizzes/quizModel.js";
import Notification from "../../../models/users/notificationModel.js";
import User from "../../../models/users/userModel.js";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNewNotification,
} from "../controllers/notificationControllers.js";

export const handleMarkNotificationAsRead = async (context, data) => {
  try {
    const models = { Notification };

    if (!Notification) {
      throw new Error("Invalid models");
    }

    const payload = markNotificationAsRead(models, data);

    if (!payload.success) {
      throw new Error(`Unable to process the request: ${response.message}`);
    }

    context.emitEvent("sender", "notification marked as read", payload);
  } catch (error) {
    console.error("Error handling mark notification as read:", error.message);

    throw new Error(
      "Error handling mark notification as read: ",
      error.message
    );
  }
};

export const handleMarkAllNotificationsAsRead = async (context, data) => {
  try {
    const models = { Notification };

    if (!Notification) {
      throw new Error("Invalid models");
    }

    const response = await markAllNotificationsAsRead(models, data);

    if (!response.success) {
      throw new Error(`Unable to process the request: ${response.message}`);
    }

    context.emitEvent("sender", "marked all as read", response);
  } catch (error) {
    console.error(
      "Error handling mark all notifications as read:",
      error.message
    );

    throw new Error(
      "Error handling mark all notifications as read: ",
      error.message
    );
  }
};

export const handleNewNotification = async (context, data) => {
  try {
    const models = { User, Notification, Quiz };

    if (!User || !Notification || !Quiz) {
      throw new Error("Invalid models");
    }

    const payload = await createNewNotification(models, data);

    if (!payload.success) {
      throw new Error(`Unable to process the request: ${response.message}`);
    }

    if (payload.notificationName === "quiz graded") {
      context.emitEvent("sender", "notification received", {
        savedNotification: response.savedNotification,
      });

      return;
    }

    context.emitEvent("receiver", "notification received", {
      savedNotification: payload.savedNotification,
      receiverId,
    });
  } catch (error) {
    console.error("Error generating new notification", error.message);
    throw new Error("Error handling new notification: ", error.message);
  }
};
