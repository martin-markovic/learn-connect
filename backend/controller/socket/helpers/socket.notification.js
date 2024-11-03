import Notification from "../../../models/users/notificationModel.js";

export const markNotificationAsRead = async (
  socket,
  notificationId,
  userId
) => {
  try {
    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      console.log("Notification not found on server");
      return socket.emit("error", { message: "Notification not found" });
    }

    if (notification.readBy.includes(userId)) {
      console.log("User is already notified.");
      return socket.emit("notification error", {
        message: "User is already notified",
      });
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
      return socket.emit("error", {
        message: "All notifications are already read",
      });
    }

    socket.emit("marked all as read", {
      message: "All notifications are marked as read.",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    socket.emit("error", {
      message: "Error updating all notification status",
    });
  }
};

export const handleNewNotification = async (socket, notificationData) => {
  const { sender, receiver, eventName, quizName, quizScore } = notificationData;

  const generateNotificationMessage = (evtName, user, classroom) => {
    if (evtName === "new message") {
      return "You have a new message";
    }

    if (evtName === "new quiz created") {
      return `${user} created a new quiz in ${classroom}`;
    }

    if (evtName === "quiz graded") {
      return `${
        user === sender ? "You" : user
      } scored ${quizScore} on quiz ${quizName}`;
    }
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

  await socket.emit("notification received", savedNotification);
};