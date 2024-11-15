import {
  addNewNotification,
  markNotificationAsRead,
  resetNotifications,
} from "./notificationSlice.js";

const handleNotificationSetup = (socketInstance, dispatch) => {
  if (!socketInstance) {
    console.error("Please provide a valid socket instance");
    return;
  }

  socketInstance.on("notification received", (data) => {
    const newNotification = data;

    if (!newNotification) {
      console.error("New notification not found");
      return;
    }

    dispatch(addNewNotification(newNotification));
  });

  socketInstance.on("notification marked as read", (data) => {
    const notificationId = data;

    if (!notificationId) {
      console.error("Notification id not found");
      return;
    }

    dispatch(markNotificationAsRead(notificationId));
  });

  socketInstance.on("marked all as read", (data) => {
    const { success } = data;

    if (!success) {
      console.error("Unable to mark all notifications as read");
      return;
    }

    dispatch(resetNotifications());
  });

  return () => {
    if (socketInstance) {
      socketInstance.off("notification received");
      socketInstance.off("notification marked as read");
      socketInstance.off("marked all as read");
    }
  };
};

export default handleNotificationSetup;
