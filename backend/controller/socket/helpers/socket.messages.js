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

export const handleStatusUpdate = async (context, data) => {
  try {
    const { senderId, receiverId, messageId } = data;

    const chatFound = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chatFound) {
      throw new Error("Chat not found");
    }

    let unreadMessages;

    if (messageId) {
      unreadMessages = await Conversation.find({ _id: messageId });
    } else {
      unreadMessages = await Conversation.find({
        sender: receiverId,
        receiver: senderId,
        isRead: false,
      });
    }


    const messageIds = unreadMessages.map((msg) => msg._id.toString());

    await Conversation.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true } }
    );

    await handleUserPresence(receiverId, {
      targetId: messageId ? "sender" : "receiver",
      emitHandler: context.emitEvent,
      userId: receiverId.toString(),
      eventName: "messages read",
      payload: {
        receiverId: receiverId.toString(),
        chatId: chatFound?._id.toString(),
        messageIds,
      },
    });

    await handleUserPresence(senderId, {
      targetId: messageId ? "receiver" : "sender",
      emitHandler: context.emitEvent,
      userId: senderId.toString(),
      eventName: "messages read",
      payload: {
        receiverId: senderId.toString(),
        chatId: chatFound?._id.toString(),
        messageIds,
      },
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
