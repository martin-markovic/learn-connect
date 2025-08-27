import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";
import User from "../../../models/users/userModel.js";
import { handleConnectionStatus } from "../config/socket.userPresence.js";
import {
  createMessage,
  updateChatMessages,
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
      throw new Error("Unable to update messages");
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
    const { senderId, receiverId, messageId } = data;

    if (!messageId) {
      throw new Error("Invalid message id");
    }

    const updatedMessage = await Conversation.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    context.emitEvent("sender", "message seen", {
      messageId: updatedMessage?._id,
      senderId,
      receiverId,
    });

    context.emitEvent("receiver", "message seen", {
      messageId: updatedMessage?._id,
      senderId,
      receiverId,
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
    const { userId, chatConnected } = data;

    const userFound = await User.findOne({ _id: userId });

    if (!userFound) {
      throw new Error("User is not authorized");
    }

    const updatedStatus = await User.findByIdAndUpdate(
      userId,
      { online: chatConnected },
      { new: true }
    );

    if (!updatedStatus) {
      throw new Error("Database update failure");
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
