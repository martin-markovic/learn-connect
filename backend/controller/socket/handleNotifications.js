const handleNotificationEvents = (socket, io) => {
  socket.on("mark as read", (data) => {
    socket.emit("new notification", notificationId);
  });

  socket.on("new notification", (data) => {
    const { notificationName } = data;

    console.log("Emitting notification received event with data", data);

    socket.emit("notification received", notificationName);
  });
};

export default handleNotificationEvents;
