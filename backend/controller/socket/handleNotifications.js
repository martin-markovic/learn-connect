const handleNotificationEvents = (socket, io) => {
  socket.on("create quiz ", (data) => {
    console.log(`${data.user} has created a new quiz ${data.quiz._id}`);

    const notificationData = {};

    socket.broadcast.to(data.room).emit("quiz created", notificationData);
  });

  socket.on("delete quiz ", (data) => {
    console.log(`${data.user} has deleted a new quiz ${data.quiz._id}`);

    const notificationData = {};

    socket.broadcast.to(data.room).emit("quiz deleted", notificationData);
  });

  socket.on("mark as read", (data) => {
    const notificationId = data.roomData;

    socket.emit("marked as read", notificationId);
  });

  socket.on("submit score", (data) => {
    console.log(
      `${data.user.name} scored ${data.quiz.score} on ${data.quiz.name}`
    );

    const notificationData = {};

    socket.broadcast.to(data.room).emit("score saved", notificationData);
  });
};

export default handleNotificationEvents;
