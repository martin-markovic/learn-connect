import handleMessages from "./messageController.js";
import handleRoomEvents from "./roomController.js";
import handleErrorEvents from "./errorController.js";
import socketMiddleware from "../../middleware/socketMiddleware.js";

const manageSocketEvents = (io) => {
  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    handleMessages(socket);
    handleRoomEvents(socket, io);
    handleErrorEvents(socket);
  });
};

export default manageSocketEvents;
