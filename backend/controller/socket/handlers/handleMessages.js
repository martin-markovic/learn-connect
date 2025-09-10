import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";
import User from "../../../models/users/userModel.js";
import { handleConnectionStatus } from "../config/socket.userPresence.js";
import {
  createMessage,
  updateChatMessages,
  markMessageSeen,
  changeChatStatus,
} from "../controllers/socket.messageControllers.js";

export const sendMessage = async (context, data) => {
  try {
    if (!Chat || !Conversation) {
      throw new Error("Invalid models");
    }

    const models = { Chat, Conversation };
    const payload = await createMessage(models, data);

    if (!payload._id) {
      throw new Error("Unable to create message payload");
    }

    const { senderId, receiverId } = data;
    if (!senderId || !receiverId) {
      throw new Error("Event participants required");
    }

    context.emitEvent("sender", "new message", payload);

    context.emitEvent("receiver", "new message", payload);
  } catch (error) {
    console.error("Error sending message: ", error.message);
  }
};

export const handleChatOpen = async (context, data) => {
  try {
    if (!Chat || !Conversation) {
      throw new Error("Invalid models");
    }

    const models = { Chat, Conversation };
    const response = await updateChatMessages(models, data);

    if (!response.success) {
      throw new Error(response.message || "Unable to update messages");
    }

    if (!response.newMessages) {
      return;
    }

    const { senderId, receiverId } = data;

    if (!senderId || !receiverId) {
      throw new Error("Event participants required");
    }

    context.emitEvent("sender", "messages read", {
      friendId: receiverId,
    });

    context.emitEvent("receiver", "messages read", {
      friendId: senderId,
      receiverId,
    });
  } catch (error) {
    console.error("Error emitting conversation read: ", error.message);
    context.socket.emit("sender", "error", { message: error.message });
  }
};

export const handleMarkAsRead = async (context, data) => {
  try {
    if (!Conversation) {
      throw new Error("Invalid models");
    }

    const models = { Conversation };

    const payload = await markMessageSeen(models, data);

    if (!payload._id) {
      throw new Error("Unable to mark message as read");
    }

    const { sender, receiver } = payload;

    if (!sender || !receiver) {
      throw new Error("Event participants required");
    }

    context.emitEvent("sender", "message seen", {
      messageId: payload?._id.toString(),
      senderId: sender.toString(),
      receiverId: receiver.toString(),
    });

    context.emitEvent("receiver", "message seen", {
      messageId: payload?._id.toString(),
      receiverId: sender.toString(),
      senderId: receiver.toString(),
    });
  } catch (error) {
    console.error("Error emitting conversation read: ", error.message);
    context.socket.emit("sender", "error", { message: error.message });
  }
};

export const handleTyping = (context, data) => {
  try {
    const { senderId, receiverId, senderName } = data;

    if (!senderId || !receiverId || !senderName) {
      throw new Error("Please provide valid client data");
    }

    context.emitEvent("receiver", "chat activity", data);
  } catch (error) {
    console.error("Error emitting chat activity", error.message);
    context.socket.emit("error", { message: error.message });
  }
};

export const handleChatStatus = async (context, data) => {
  try {
    const { userId } = data;

    if (!userId) {
      throw new Error("User id is required");
    }

    if (!User) {
      throw new Error("Invalid models");
    }

    const models = { User };

    const { updatedStatus, success } = await changeChatStatus(models, data);

    if (!success || !updatedStatus) {
      throw new Error("Unable to update chat status");
    }

    context.emitEvent("sender", "chat status changed", {
      success: true,
      online: updatedStatus?.online,
    });

    if (!updatedStatus.online) {
      await handleConnectionStatus(context, userId, "offline");
    }
  } catch (error) {
    console.error("Error turning off chat events: ", error.message);
    context.emitEvent("sender", "error", error.message);
  }
};
