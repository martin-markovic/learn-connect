import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";
import User from "../../../models/users/userModel.js";
import { handleConnectionStatus } from "./socket.userPresence.js";

export const sendMessage = async (context, data) => {
  try {
    let messagePayload;

    const { senderId, receiverId, text } = data;

    if (!senderId || !text || !receiverId) {
      throw new Error("Please provide required message data");
    }

    let chatFound = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chatFound) {
      const newMessage = new Conversation({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      await newMessage.save();

      const populatedMessage = await Conversation.findById(newMessage._id)
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar");

      const newChat = new Chat({
        participants: [senderId, receiverId],
        conversation: [newMessage._id],
      });

      chatFound = await newChat.save();

      messagePayload = {
        chatId: chatFound?._id.toString(),
        _id: populatedMessage?._id.toString(),
        senderId: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        senderAvatar: populatedMessage.sender.avatar,
        receiverId: populatedMessage.receiver._id.toString(),
        receiverName: populatedMessage.receiver.name,
        receiverAvatar: populatedMessage.receiver.avatar,
        text: populatedMessage.text,
        isRead: populatedMessage.isRead,
        createdAt: populatedMessage.createdAt,
      };
    } else {
      const newMessage = new Conversation({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      await newMessage.save();
      chatFound.conversation.push(newMessage._id);

      await chatFound.save();

      const populatedMessage = await Conversation.findById(newMessage._id)
        .populate("sender", "name avatar")
        .populate("receiver", "name avatar");

      messagePayload = {
        _id: populatedMessage?._id.toString(),
        senderId: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        senderAvatar: populatedMessage.sender.avatar,
        receiverId: populatedMessage.receiver._id.toString(),
        receiverName: populatedMessage.receiver.name,
        receiverAvatar: populatedMessage.receiver.avatar,
        text: populatedMessage.text,
        isRead: populatedMessage.isRead,
        createdAt: populatedMessage.createdAt,
      };
    }

    context.emitEvent("sender", "new message", messagePayload);

    context.emitEvent("receiver", "new message", messagePayload);
  } catch (error) {
    console.error("Error sending message: ", error.message);
  }
};

export const handleChatOpen = async (context, data) => {
  try {
    const { senderId, receiverId } = data;

    const chatFound = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chatFound || !chatFound?.conversation?.length) {
      throw new Error("Chat not found");
    }

    await Conversation.updateMany(
      {
        _id: { $in: chatFound.conversation },
        receiver: senderId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    context.emitEvent("sender", "messages read", { friendId: receiverId });

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
