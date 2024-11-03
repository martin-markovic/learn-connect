import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleNewNotification,
} from "./helpers/socket.notification.js";

const handleNotificationEvents = (socket, io) => {
  socket.on("mark as read", async (data) => {
    const { notificationId } = data;

    const userId = socket.user?.id;

    await markNotificationAsRead(socket, notificationId, userId);
  });

  socket.on("mark all as read", async () => {
    const userId = socket.user?.id;

    await markAllNotificationsAsRead(socket, userId);
  });

  socket.on("new notification", async (data) => {
    const { classroom, eventName } = data.roomData;

    console.log("Emitting notification received event with data", data);

    await handleNewNotification(socket, notificationData);
  });
};

export default handleNotificationEvents;
