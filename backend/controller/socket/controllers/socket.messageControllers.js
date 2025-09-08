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

      const savedMessage = await newMessage.save();

      const populatedMessage = await Conversation.findById(
        savedMessage._id,
        null,
        {
          populate: [
            { path: "sender", select: "name avatar" },
            { path: "receiver", select: "name avatar" },
          ],
        }
      );

      if (!populatedMessage) {
        throw new Error("Failed to retrieve saved message");
      }

      const newChat = new Chat({
        participants: [senderId, receiverId],
        conversation: [newMessage._id],
      });

      chatFound = await newChat.save();

      messagePayload = {
        chatId: chatFound?._id.toString(),
        _id: populatedMessage?._id?.toString(),
        senderId: populatedMessage?.sender?._id.toString(),
        senderName: populatedMessage?.sender?.name,
        senderAvatar: populatedMessage?.sender?.avatar,
        receiverId: populatedMessage?.receiver?._id.toString(),
        receiverName: populatedMessage?.receiver?.name,
        receiverAvatar: populatedMessage?.receiver?.avatar,
        text: populatedMessage?.text,
        isRead: populatedMessage?.isRead,
        createdAt: populatedMessage?.createdAt,
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
        senderId: populatedMessage?.sender?._id.toString(),
        senderName: populatedMessage?.sender?.name,
        senderAvatar: populatedMessage?.sender?.avatar,
        receiverId: populatedMessage?.receiver?._id.toString(),
        receiverName: populatedMessage?.receiver?.name,
        receiverAvatar: populatedMessage?.receiver?.avatar,
        text: populatedMessage?.text,
        isRead: populatedMessage?.isRead,
        createdAt: populatedMessage?.createdAt,
      };

      return messagePayload;
    }
  } catch (error) {
    const errorMessage = `Error creating new message: ${
      error.message || "Server error"
    }`;

    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateChatMessages = async (models, data) => {
  try {
    const { Chat, Conversation } = models;
    if (!Chat || !Conversation) {
      throw new Error("Missing models");
    }

    const { senderId, receiverId } = data;

    const chatFound =
      (await Chat.findOne({
        participants: { $all: [senderId, receiverId] },
      })) || [];

    if (!chatFound?.conversation?.length) {
      return { success: true, newMessage: false };
    }

    await Conversation.updateMany(
      {
        _id: { $in: chatFound.conversation },
        receiver: senderId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return { success: true, newMessages: true };
  } catch (error) {
    console.error(
      "Error updating chat messages: ",
      error.message || "Server error"
    );
    return { success: false, error: error.message };
  }
};

export const markMessageSeen = async (models, data) => {
  try {
    const { Conversation } = models;
    if (!Conversation) {
      throw new Error("Missing models");
    }

    const { messageId } = data;

    if (!messageId) {
      throw new Error("Invalid message id");
    }

    const updatedMessage = await Conversation.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    return updatedMessage;
  } catch (error) {
    console.error(
      "Error updating chat messages: ",
      error.message || "Server error"
    );
  }
};

export const changeChatStatus = async (models, data) => {
  try {
    const { User } = models;

    if (!User) {
      throw new Error("Missing models");
    }

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

    return { updatedStatus, success: true };
  } catch (error) {
    console.error(
      "Error changing chat status: ",
      error.message || "Server error"
    );
  }
};
