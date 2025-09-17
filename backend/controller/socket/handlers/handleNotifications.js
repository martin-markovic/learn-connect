import Quiz from "../../../models/quizzes/quizModel.js";
import Notification from "../../../models/users/notificationModel.js";
import User from "../../../models/users/userModel.js";
import {
  createNewNotification,
} from "../controllers/notificationControllers.js";

export const markNotificationAsRead = async (context, data) => {
  try {
    const { notificationId } = data;

    if (!notificationId) {
      throw new Error("Invalid notification id");
    }

    const notificationFound = await Notification.findOne({
      _id: notificationId,
    });

    if (!notificationFound) {
      throw new Error("Notification not found on server");
    }

    if (notificationFound?.isRead) {
      throw new Error("Notification already marked as read");
    }

    await Notification.findByIdAndUpdate(
      notificationId,
      {
        $set: {
          isRead: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
      { new: true }
    );

    context.emitEvent("sender", "notification marked as read", notificationId);
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    context.emitEvent("sender", "error", {
      message: "Error updating notification status",
    });
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
