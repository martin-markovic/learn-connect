import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  handleNewNotification,
} from "./helpers/socket.notification.js";

const handleNotificationEvents = (context) => {
  context.socket.on("mark as read", async (data) => {
    await markNotificationAsRead(context, data);
  });

  context.socket.on("mark all as read", async (data) => {
    await markAllNotificationsAsRead(context, data);
  });

  context.socket.on("new notification", async (data) => {
    await handleNewNotification(context, data);
  });
};

export default handleNotificationEvents;
