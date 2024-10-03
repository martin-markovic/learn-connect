import handleMessages from "./messageController.js";
import handleRoomEvents from "./roomController.js";
import handleErrorEvents from "./errorController.js";

const handleSocketLifeCycle = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected with ID: ${socket.user._id}`);

    handleMessages(socket, io);
    handleRoomEvents(socket, io);
    handleErrorEvents(socket);

    socket.on("connection_error", (err) => {
      console.error("Connection Error:", err.message);
    });

    socket.on("error", (err) => {
      console.error("Socket.IO error:", err);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default handleSocketLifeCycle;
