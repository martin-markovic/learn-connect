import {
  handleMarkNotificationAsRead,
  handleMarkAllNotificationsAsRead,
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
    try {
      await handleMarkAllNotificationsAsRead(context, data);
    } catch (error) {
      console.error(`Error emitting event mark all as read: `, error.message);
    }
  });

  context.socket.on("new notification", async (data) => {
    try {
      await handleNewNotification(context, data);
    } catch (error) {
      console.error(`Error emitting event new notification: `, error.message);
    }
  });
};

export default manageNotificationEvents;
