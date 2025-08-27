import {
  sendMessage,
  handleMarkAsRead,
  handleChatOpen,
  handleTyping,
  handleChatStatus,
} from "../handlers/handleMessages.js";
import validateFriendship from "../../../middleware/socialMiddleware.js";
import { handleConnectionStatus } from "../config/socket.userPresence.js";

const manageMessages = (context) => {
  context.socket.on("connect chat", async (data) => {
    try {
      await handleConnectionStatus(context, data?.senderId, "connected");
    } catch (error) {
      console.error("Error emitting chat connected event: ", error.message);
    }
  });

  context.socket.on("send message", async (data) => {
    try {
      await validateFriendship(data, async () => {
        await sendMessage(context, data);
      });
    } catch (error) {
      console.error("Error emitting send message event: ", error.message);
    }
  });

  context.socket.on("user typing", async (data) => {
    try {
      await validateFriendship(data, () => {
        handleTyping(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("message read", async (data) => {
    try {
      await validateFriendship(data, async () => {
        await handleMarkAsRead(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("open chat", async (data) => {
    try {
      await validateFriendship(data, async () => {
        await handleChatOpen(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("change chat status", async (data) => {
    await handleChatStatus(context, data);
  });

  context.socket.on("reconnect chat", async (data) => {
    try {
      await handleConnectionStatus(context, data?.userId, "reconnected");
    } catch (error) {
      console.error("Error reconnecting chat: ", error.message);
      context.emitEvent("sender", "error", error.message);
    }
  });
};

export default manageMessages;
