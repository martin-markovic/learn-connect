import handleMessages from "./messageController.js";
import handleRoomEvents from "./roomController.js";
import handleErrorEvents from "./errorController.js";

const handleSocketLifeCycle = (io) => {
  io.on("connection", (socket) => {
    console.log(`New connection: Socket ID ${socket.id}`);

    if (!socket.user || !socket.user.id) {
      console.log("User ID is undefined, aborting socket event handlers");
      return;
    }

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
