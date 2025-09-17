import {
  markAllNotificationsAsRead,
  handleMarkNotificationAsRead,
  handleNewNotification,
} from "../handlers/handleNotifications.js";

const manageNotificationEvents = (context) => {
  context.socket.on("mark as read", async (data) => {
    try {
      await handleMarkNotificationAsRead(context, data);
    } catch (error) {
      console.error(`Error emitting event mark as read: `, error.message);
    }
  });

  context.socket.on("mark all as read", async (data) => {
    await markAllNotificationsAsRead(context, data);
  });

  context.socket.on("new notification", async (data) => {
    await handleNewNotification(context, data);
  });
};

export default handleNotificationEvents;
