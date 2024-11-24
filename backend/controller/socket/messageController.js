import {
  sendMessage,
  handleChatOpen,
  handleTyping,
} from "./helpers/socket.messages.js";

const handleMessages = (socket, io) => {
  socket.on("send message", async (data) => {
    const roomData = data.roomData;

    return await sendMessage(socket, io, roomData);
  });

  socket.on("user typing", (data) => {
    const roomData = data.roomData;


    return handleTyping(socket, io, roomData);
  });

  socket.on("open conversation", async (data) => {
    const roomData = data.roomData;

    return handleChatOpen(socket, io, roomData);
  });
};

export default handleMessages;
