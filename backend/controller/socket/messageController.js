import {
  sendMessage,
  handleChatOpen,
  handleTyping,
} from "./helpers/socket.messages.js";
import validateFriendship from "../../middleware/socialMiddleware.js";

const handleMessages = (socket, io, userSocketMap) => {
  socket.on("send message", async (data) => {
    socket.data = data;
    validateFriendship(socket, async () => {
      await sendMessage(socket, io, data, userSocketMap);
    });
  });

  socket.on("user typing", (data) => {
    socket.data = data;

    validateFriendship(socket, async () => {
      await handleTyping(socket, io, data, userSocketMap);
    });
  });

  socket.on("open conversation", async (data) => {
    socket.data = data;
    validateFriendship(socket, async () => {
      await handleChatOpen(socket, io, data, userSocketMap);
    });
  });
};

export default handleMessages;
