import mongoose from "mongoose";
import Chat from "../../models/chat/chatModel.js";

export const getMessages = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(401).json({ message: "User not authorized" });
  }

  try {
    const userChats = await Chat.find({ participants: userId })
      .populate({
        path: "conversation",
        populate: {
          path: "sender receiver",
          select: "name",
        },
      })
      .exec();

    if (!userChats || userChats.length === 0) {
      return res.status(200).json([]);
    }

    const formattedChats = userChats.map((chat) => {
      const formattedMessages = chat.conversation.map((message) => ({
        _id: message._id,
        text: message.text,
        senderId: message.sender?._id,
        senderName: message.sender?.name,
        receiverId: message.receiver?._id,
        receiverName: message.receiver?.name,
        timestamp: message.timestamp,
        isRead: message.isRead,
      }));

      return {
        chatId: chat._id.toString(),
        messages: formattedMessages,
      };
    });

    return res.status(200).json(formattedChats);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const removeMessages = async (req, res) => {
  const chatId = req.params.chatId;
  const { messageIds } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!Array.isArray(messageIds) || !messageIds.length) {
      return res.status(400).json({ message: "Invalid message IDs provided." });
    }

    await Chat.updateOne(
      { _id: chatId },
      { $pull: { chats: { $in: messageIds } } },
      { session }
    );

    console.log(`Removed references to messages from classroom ${chatId}`);

    console.log(`Deleted messages from chats collection: ${messageIds}`);

    await session.commitTransaction();

    await Chat.deleteMany({ _id: { $in: messageIds } }, { session });

    return res.status(200).json(chatId);
  } catch (error) {
    await session.abortTrainsaction();
    console.error("Error removing message references:", error);
    return res.status(500).json({
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};
