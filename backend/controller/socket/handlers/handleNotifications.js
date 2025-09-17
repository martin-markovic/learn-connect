import Quiz from "../../../models/quizzes/quizModel.js";
import Notification from "../../../models/users/notificationModel.js";
import User from "../../../models/users/userModel.js";
import {
  markNotificationAsRead,
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

export const markAllNotificationsAsRead = async (context, data) => {
  try {
    const { senderId } = data;

    const result = await Notification.updateMany(
      { receiver: senderId, isRead: false },
      {
        $set: {
          isRead: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("All notifications are already read");
    }

    const response = {
      success: true,
    };

    context.emitEvent("sender", "marked all as read", response);
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    context.emitEvent("sender", "error", {
      message: "Error updating all notification status",
    });
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
