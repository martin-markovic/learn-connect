import Notification from "../../models/users/notificationModel.js";

const handleNotificationEvents = (socket, io) => {
  socket.on("mark as read", async (data) => {
    const notificationId = data.roomData;

    const userId = socket.user?.id;

    try {
      const notification = await Notification.findOne({ _id: notificationId });

      if (!notification) {
        console.log("Notification not found on server");
        return socket.emit("error", { message: "Notification not found" });
      }

      const userNotified = notification.readBy.includes(userId);

      if (userNotified) {
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
  });

  socket.on("mark all as read", async (data) => {
    try {
      const userId = socket.user?.id;

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
      console.error("Error marking all notifications as read: ", error.message);
      socket.emit("error", {
        message: "Error updating all notification status",
      });
    }
  });

  socket.on("new notification", (data) => {
    const { notificationName } = data;

    console.log("Emitting notification received event with data", data);

    socket.emit("notification received", notificationName);
  });
};

export default handleNotificationEvents;
