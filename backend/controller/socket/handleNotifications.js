import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleNewNotification,
} from "./helpers/socket.notification.js";

const handleNotificationEvents = (context) => {
  context.socket.on("mark as read", async (data) => {
    const { notificationId } = data.roomData;

    const userId = socket.user?.id;

    await markNotificationAsRead(socket, notificationId, userId);
  });

  context.socket.on("mark all as read", async () => {
    const userId = socket.user?.id;

    await markAllNotificationsAsRead(socket, userId);
  });

  context.socket.on("new notification", async (data) => {
    const { classroom, eventName } = data.roomData;

    const notificationData = {
      sender: socket.user?.id,
      receiver: classroom,
      eventName,
    };

    await handleNewNotification(socket, notificationData);
  });
};

export default handleNotificationEvents;
