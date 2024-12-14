import {
  setUserSocket,
  removeUserSocket,
  createSocketContext,
} from "./helpers/socket.init.js";
import handleMessages from "./messageController.js";
import handleNotificationEvents from "./handleNotifications.js";
import handleSocialEvents from "./handleSocial.js";
import handleErrorEvents from "./helpers/socket.errorController.js";

const handleSocketLifeCycle = (io) => {
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

    setUserSocket(userId, socket.id);

    const context = createSocketContext(socket, io);

    handleMessages(context);
    handleNotificationEvents(context);
    handleSocialEvents(context);
    handleErrorEvents(socket);

    socket.on("disconnect", () => {
      removeUserSocket(userId);
    });
  });
};

export default handleSocketLifeCycle;
