import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";
import Event from "../../../models/socket/eventModel.js";
import emitWithRetry from "../handleEmitEvent.js";

export const sendMessage = async (socket, io, data, userSocketMap) => {
  try {
    const { senderId, receiverId, text } = data;

    if (!senderId || !text || !receiverId) {
      throw new Error("Please provide required message data");
    }

    const conversationFound = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    let messagePayload;

    if (!conversationFound) {
      const newMessage = new Conversation({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      await newMessage.save();

      const populatedMessage = await Conversation.findById(newMessage._id)
        .populate("sender", "name _id")
        .populate("receiver", "name _id");

      const newChat = new Chat({
        participants: [senderId, receiverId],
        conversation: [newMessage._id],
      });

      await newChat.save();

      messagePayload = populatedMessage;
    } else {
      const newMessage = new Conversation({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      await newMessage.save();
      conversationFound.conversation.push(newMessage._id);

      await conversationFound.save();

      messagePayload = await Conversation.findById(newMessage._id)
        .populate("sender", "name")
        .populate("receiver", "name");
    }

    const senderOnline = userSocketMap.get(senderId);
    const receiverOnline = userSocketMap.get(receiverId);

    if (senderOnline) {
      socket.emit("new message", messagePayload, async (ack) => {
        if (ack) {
          await Event.findOneAndDelete({
            user: senderId,
            eventName: "new message",
            payload: messagePayload,
          });
        } else {
          console.log(
            `New message event successfully emitted for user ${senderId}`
          );
        }
      });
    } else {
      const eventData = {
        eventName: "new message",
        userId: senderId,
        payload: messagePayload,
      };

      emitWithRetry(socket, eventData);
    }

    if (receiverOnline) {
      io.to(receiverOnline).emit("new message", messagePayload, async (ack) => {
        if (ack) {
          await Event.findOneAndDelete({
            user: receiverId,
            eventName: "new message",
            payload: messagePayload,
          });
        } else {
          console.log(
            `New message event successfully emitted for user ${receiverId}`
          );
        }
      });
    } else {
      const eventData = {
        eventName: "new message",
        userId: receiverId,
        payload: messagePayload,
      };

      emitWithRetry(io, eventData);
    }
  } catch (error) {
    console.error("Error sending message: ", error.message);
  }
};

export const handleChatOpen = async (socket, io, data, userSocketMap) => {
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

    const targetedId = userSocketMap.get(receiverId);

    if (!targetedId) {
      throw new Error("User is currently offline");
    }

    socket.emit("conversation read", messageId);
    io.to(targetedId).emit("conversation read", messageId);
  } catch (error) {
    console.log("Error emitting conversation read: ", error.message);
    socket.emit("error", { message: error.message });
  }
};

export const handleTyping = async (socket, io, data, userSocketMap) => {
  try {
    const { senderId, receiverId, senderName } = data;

    if (!senderId || !receiverId || !senderName) {
      throw new Error("Please provide valid client data");
    }

    const targetedId = userSocketMap.get(receiverId);

    if (!targetedId) {
      console.log("targetedId: ", targetedId);
      throw new Error("User is currently offline");
    }

    io.to(targetedId).emit("chat activity", {
      senderName,
    });
  } catch (error) {
    console.log("Error emitting chat activity", error.message);
    socket.emit("error", { message: error.message });
  }
};
