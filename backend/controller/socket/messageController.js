import {
  sendMessage,
  handleMarkAsRead,
  handleChatOpen,
  handleTyping,
  handleChatStatus,
} from "./helpers/socket.messages.js";
import validateFriendship from "../../middleware/socialMiddleware.js";

const handleMessages = (context) => {
  context.socket.on("send message", (data) => {
    try {
      validateFriendship(data, async () => {
        await sendMessage(context, data);
      });
    } catch (error) {
      console.error("Error emitting send message event: ", error.message);
    }
  });

  context.socket.on("user typing", (data) => {
    try {
      validateFriendship(data, () => {
        handleTyping(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("message read", async (data) => {
    try {
      validateFriendship(data, async () => {
        await handleMarkAsRead(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("open chat", async (data) => {
    try {
      validateFriendship(data, async () => {
        await handleChatOpen(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("change chat status", async (data) => {
    await handleChatStatus(context, data);
  });
};

export default handleMessages;
