export const createMessage = async (models, data) => {
  try {
    const { Chat, Conversation } = models;

    if (!Chat || !Conversation) {
      throw new Error("Missing models");
    }

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

      return messagePayload;
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

      return messagePayload;
    }
  } catch (error) {
    console.error(
      "Error creating new message: ",
      error.message || "Server error"
    );
    throw error;
  }
};
