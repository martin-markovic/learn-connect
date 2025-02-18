import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";

export const sendMessage = async (context, data) => {
  try {
    let messagePayload;

    const { senderId, receiverId, text } = data;

    if (!senderId || !text || !receiverId) {
      throw new Error("Please provide required message data");
    }

    const chatFound = await Chat.findOne({
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
        .populate("sender", "name")
        .populate("receiver", "name");

      const newChat = new Chat({
        participants: [senderId, receiverId],
        conversation: [newMessage._id],
      });

      await newChat.save();

      messagePayload = {
        chatId: newChat._id,
        _id: populatedMessage?._id.toString(),
        senderId: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        receiverId: populatedMessage.receiver._id.toString(),
        receiverName: populatedMessage.receiver.name,
        text: populatedMessage.text,
        isRead: populatedMessage.isRead,
        timestamp: populatedMessage.createdAt,
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
        .populate("sender", "name")
        .populate("receiver", "name");

      messagePayload = {
        _id: populatedMessage?._id.toString(),
        senderId: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        receiverId: populatedMessage.receiver._id.toString(),
        receiverName: populatedMessage.receiver.name,
        text: populatedMessage.text,
        isRead: populatedMessage.isRead,
        timestamp: populatedMessage.timestamp,
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
      { _id: { $in: chatFound.conversation }, isRead: false },
      { $set: { isRead: true } }
    );


    context.emitEvent("sender", "messages read", { friendId: receiverId });

    context.emitEvent("receiver", "messages read", {
      friendId: senderId,
      receiverId,
    });
  } catch (error) {
    console.log("Error emitting conversation read: ", error.message);
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
    console.log("Error emitting conversation read: ", error.message);
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
    console.log("Error emitting chat activity", error.message);
    context.socket.emit("error", { message: error.message });
  }
};
