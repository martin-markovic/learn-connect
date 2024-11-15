import emitRoomEvent from "./roomHandlers.js";

export const emitMarkAsRead = async (socketInstance, notificationId) => {
  if (!socketInstance) {
    console.error("Please provide a valid socket instance");
    return;
  }

  const clientData = {
    socketInstance,
    eventName: "mark as read",
    roomData: { notificationId },
  };

  await emitRoomEvent(clientData);
};

export const emitMarkAllAsRead = async (socketInstance) => {
  if (!socketInstance) {
    console.error("Please provide a valid socket instance");
    return;
  }

  const clientData = {
    socketInstance,
    eventName: "mark all as read",
    roomData: {},
  };

  await emitRoomEvent(clientData);
};
