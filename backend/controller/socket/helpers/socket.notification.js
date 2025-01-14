import Notification from "../../../models/users/notificationModel.js";

export const markNotificationAsRead = async (context, data) => {
  try {
    const { senderId, notificationId } = data;

    if (!notificationId) {
      throw new Error("Invalid notification id");
    }

    const notificationFound = await Notification.findOne({
      _id: notificationId,
    });

    if (!notificationFound) {
      console.log("Notification not found on server");
      throw new Error("Notification not found");
    }

    if (notificationFound.readBy.includes(senderId)) {
      console.log("User is already notified.");
      throw new Error("User is already notified");
    }

    await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: senderId } },
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
      { readBy: { $ne: senderId } },
      { $push: { readBy: senderId } }
    );

    if (result.nModified === 0) {
      throw new Error("All notifications are already read");
    }

    const response = {
      message: "All notifications are marked as read.",
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
  const { senderId, receiverId, eventName, quizName, quizScore } = data;

  try {
    const generateNotificationMessage = (evtName, user, classroom) => {
      if (evtName === "new quiz created") {
        return `${user} created a new quiz in ${classroom}`;
      }
      if (evtName === "new quiz created") {
        return `${user} created a new quiz in ${classroom}`;
      }

      if (evtName === "quiz graded") {
        return `${
          user === sender ? "You" : user
        } scored ${quizScore} on quiz ${quizName}`;
      }

      return "";
    };

    const generatedMessage = generateNotificationMessage(
      eventName,
      senderId,
      receiverId
    );

    const newNotification = new Notification({
      senderId,
      receiverId,
      message: generatedMessage,
    });

    const savedNotification = await newNotification.save();

    context.emitEvent("sender", "notification received", savedNotification);
  } catch (error) {
    console.error("Error generating new notification", error.message);
    context.emitEvent("sender", "error", {
      message: "Error creating new notification",
    });
  }
};
