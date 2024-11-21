import handleMessages from "./messageController.js";

import handleNotificationEvents from "./handleNotifications.js";
import handleSocialEvents from "./handleSocial.js";
import handleErrorEvents from "./helpers/socket.errorController.js";

const handleSocketLifeCycle = (io) => {
  const userSocketMap = new Map();

  io.on("connection", (socket) => {
    console.log(`New connection: Socket ID ${socket.id}`);

    const userId = socket.user?.id;
    if (!userId) {
      console.log("User ID is undefined, aborting socket event handlers");
      return;
    }

    if (!socket.user || !socket.user.id) {
      console.log("User ID is undefined, aborting socket event handlers");
      return;
    }

    userSocketMap.set(userId, socket.id);
    console.log(`Mapped userId ${userId} to socketId ${socket.id}`);

    handleMessages(socket, io, userSocketMap);
    handleNotificationEvents(socket, io, userSocketMap);
    handleSocialEvents(socket, io, userSocketMap);
    handleErrorEvents(socket);

    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
      console.log(`Removed mapping for userId ${userId}`);
    });
  });
};

export default handleSocketLifeCycle;
