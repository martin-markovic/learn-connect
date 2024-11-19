import handleMessages from "./messageController.js";

import handleNotificationEvents from "./handleNotifications.js";
import handleSocialEvents from "./handleSocial.js";
import handleErrorEvents from "./helpers/socket.errorController.js";

const handleSocketLifeCycle = (io) => {
  io.on("connection", (socket) => {
    console.log(`New connection: Socket ID ${socket.id}`);

    if (!socket.user || !socket.user.id) {
      console.log("User ID is undefined, aborting socket event handlers");
      return;
    }

    handleMessages(socket, io);
    handleNotificationEvents(socket, io);
    handleSocialEvents(socket, io);
    handleErrorEvents(socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default handleSocketLifeCycle;
