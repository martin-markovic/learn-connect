import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";
import handleUserPresence from "../handleUserPresence.js";

export const sendMessage = async (context, data, ack) => {
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
        chatId: chatFound._id,
        senderId: populatedMessage.sender._id.toString(),
        senderName: populatedMessage.sender.name,
        receiverId: populatedMessage.receiver._id.toString(),
        receiverName: populatedMessage.receiver.name,
        text: populatedMessage.text,
        isRead: populatedMessage.isRead,
        timestamp: populatedMessage.timestamp,
      };
    }

    await handleUserPresence(
      senderId,
      {
        targetId: "sender",
        emitHandler: context.emitEvent,
        userId: senderId,
        eventName: "new message",
        payload: messagePayload,
      },
      ack
    );

    await handleUserPresence(
      receiverId,
      {
        targetId: "receiver",
        emitHandler: context.emitEvent,
        userId: receiverId,
        eventName: "new message",
        payload: messagePayload,
      },
      ack
    );
  } catch (error) {
    console.error("Error sending message: ", error.message);
  }
};

export const handleChatOpen = async (context, data) => {
  try {
    const { senderId, messageId } = data;

    if (!senderId || !messageId) {
      throw new Error("Invalid chat data");
    }

    const message = await Conversation.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      throw new Error("Message not found");
    }

    await handleUserPresence(senderId, {
      emitHandler: context.emitToReceiver,
      userId: senderId,
      eventName: "conversation read",
      payload: messageId,
    });

    await handleUserPresence(receiverId, {
      emitHandler: context.emitToReceiver,
      userId: receiverId,
      eventName: "conversation read",
      payload: messageId,
    });
  } catch (error) {
    console.log("Error emitting conversation read: ", error.message);
    context.socket.emit("error", { message: error.message });
  }
};

export const handleTyping = async (context, data, ack) => {
  try {
    const { senderId, receiverId, senderName } = data;

    if (!senderId || !receiverId || !senderName) {
      throw new Error("Please provide valid client data");
    }

    const eventData = {
      targetId: "receiver",
      emitHandler: context.emitEvent,
      userId: receiverId,
      eventName: "chat activity",
      payload: data,
    };

    await handleUserPresence(receiverId, eventData, ack);
  } catch (error) {
    console.log("Error emitting chat activity", error.message);
    context.socket.emit("error", { message: error.message });
  }
};
