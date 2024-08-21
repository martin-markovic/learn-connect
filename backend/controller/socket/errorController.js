const handleErrorEvents = (socket) => {
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
};

export default handleErrorEvents;
