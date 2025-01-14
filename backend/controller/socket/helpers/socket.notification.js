import Notification from "../../../models/users/notificationModel.js";
import User from "../../../models/users/userModel.js";

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
  const { senderId, receiverId, notificationName, quizScore, quizName } = data;

  try {
    const { name: senderName } = await User.findOne({
      _id:
        notificationName === "friend request accepted" ? receiverId : senderId,
    }).select("name");

    if (!senderName) {
      throw new Error("User does not exist");
    }

    const notificationData = {
      evtName: notificationName,
      userName: senderName,
      quizScore: quizScore ? quizScore : undefined,
      quizName: quizName ? quizName : undefined,
    };

    const generatedMessage = generateNotificationMessage(notificationData);

    const newNotification = new Notification({
      receiver: notificationName === "quiz graded" ? senderId : receiverId,
      message: generatedMessage,
    });

    const savedNotification = await newNotification.save();

    if (notificationName === "quiz graded") {
      context.emitEvent("sender", "notification received", savedNotification);
      return;
    }

    context.emitEvent("receiver", "notification received", {
      savedNotification,
      receiverId,
    });
  } catch (error) {
    console.error("Error generating new notification", error.message);
    context.emitEvent("sender", "error", {
      message: "Error creating new notification",
    });
  }
};

const generateNotificationMessage = (data) => {
  const { evtName, userName, quizScore, quizName } = data;

  if (evtName === "new friend request") {
    return `${userName} sent you a friend request`;
  }

  if (evtName === "friend request accepted") {
    return `${userName} accepted your friend request`;
  }

  if (evtName === "new quiz created") {
    return `${userName} created a new quiz`;
  }

  if (evtName === "quiz graded") {
    return `You scored ${quizScore} points on quiz ${quizName}`;
  }

  return "";
};
