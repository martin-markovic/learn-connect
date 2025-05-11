import {
  setUserSocket,
  removeUserSocket,
  createSocketContext,
} from "./helpers/socket.init.js";
import handleMessages from "./messageController.js";
import handleNotificationEvents from "./handleNotifications.js";
import handleSocialEvents from "./handleSocial.js";
import handleQuizEvents from "./handleQuiz.js";
import handleExamEvents from "./handleExam.js";
import handleErrorEvents from "./helpers/socket.errorController.js";
import { handleConnectionStatus } from "./helpers/socket.userPresence.js";

const handleSocketLifeCycle = (io) => {
  io.on("connection", (socket) => {
    console.log(`New connection: Socket ID ${socket.id}`);

    const userId = socket?.user?.id;
    if (!userId) {
      console.error("User ID is undefined, aborting socket event handlers");
      return;
    }

    setUserSocket(userId, socket.id);

    const context = createSocketContext(socket, io);

    handleConnectionStatus(context, { userId, isOnline: true });

    handleMessages(context);
    handleNotificationEvents(context);
    handleSocialEvents(context);
    handleQuizEvents(context);
    handleExamEvents(context);
    handleErrorEvents(socket);

    socket.on("disconnect", () => {
      handleConnectionStatus(context, { userId, isOnline: false });

      console.log("User disconnected: ", userId);
      removeUserSocket(userId);
    });
  });
};

export default handleSocketLifeCycle;
