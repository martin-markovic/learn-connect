import Notification from "../../../models/users/notificationModel.js";
import Chat from "../../../models/chat/chatModel.js";

export const markNotificationAsRead = async (
  socket,
  notificationId,
  userId
) => {
  try {
    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      console.log("Notification not found on server");
      socket.emit("error", { message: "Notification not found" });
      return;
    }

    if (notification.readBy.includes(userId)) {
      console.log("User is already notified.");
      socket.emit("error", {
        message: "User is already notified",
      });
      return;
    }

    await Notification.updateOne(
      { _id: notificationId },
      { $push: { readBy: userId } }
    );

    socket.emit("notification marked as read", notificationId);
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    socket.emit("error", { message: "Error updating notification status" });
  }
};

export const markAllNotificationsAsRead = async (socket, userId) => {
  try {
    const result = await Notification.updateMany(
      { readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    if (result.nModified === 0) {
      socket.emit("error", {
        message: "All notifications are already read",
      });
      return;
    }

    const response = {
      message: "All notifications are marked as read.",
      success: true,
    };

    socket.emit("marked all as read", response);
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    socket.emit("error", {
      message: "Error updating all notification status",
    });
  }
};

export const handleNewNotification = async (socket, notificationData) => {
  const { sender, receiver, eventName, quizName, quizScore } = notificationData;

  try {
    const unreadMessagesCount = await Chat.countDocuments({
      classroom: receiver,
      isRead: false,
    });

    const generateNotificationMessage = (evtName, user, classroom) => {
      if (evtName === "new message") {
        return `You have ${
          unreadMessagesCount === 0 ? "a" : unreadMessagesCount + 1
        } new message${unreadMessagesCount > 0 ? "s" : ""}`;
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
      sender,
      receiver
    );

    const newNotification = new Notification({
      sender,
      receiver,
      message: generatedMessage,
    });

    const savedNotification = await newNotification.save();

    const isBroadcast = eventName === "new message";
    const target = isBroadcast ? io.broadcast.to(receiver) : io.to(receiver);

    target.emit("notification received", savedNotification);
  } catch (error) {
    console.error("Error generating new notification", error.message);
    socket.emit("error", {
      message: "Error creating new notification",
    });
  }
};
