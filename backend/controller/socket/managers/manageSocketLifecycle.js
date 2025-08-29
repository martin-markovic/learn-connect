import {
  setUserSocket,
  removeUserSocket,
  createSocketContext,
} from "../config/socket.init.js";
import manageMessages from "./manageMessages.js";
import manageNotificationEvents from "./manageNotifications.js";
import manageSocialEvents from "./manageSocial.js";
import manageQuizEvents from "./manageQuiz.js";
import manageExamEvents from "./manageExams.js";
import manageErrorEvents from "./manageSocketError.js";
import { handleConnectionStatus } from "../config/socket.userPresence.js";

const handleSocketLifeCycle = (io) => {
  io.on("connection", async (socket) => {
    console.log(`New connection: Socket ID ${socket.id}`);

    const userId = socket?.user?.id;
    if (!userId) {
      console.error("User ID is undefined, aborting socket event handlers");
      return;
    }

    setUserSocket(userId, socket.id);

    const context = createSocketContext(socket, io);

    manageMessages(context);
    manageNotificationEvents(context);
    manageSocialEvents(context);
    manageQuizEvents(context);
    manageExamEvents(context);
    manageErrorEvents(socket);

    socket.on("disconnect", async () => {
      await handleConnectionStatus(context, userId, "disconnected");

      console.log("User disconnected: ", userId);
      removeUserSocket(userId);
    });
  });
};

export default handleSocketLifeCycle;
