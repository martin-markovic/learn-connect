import Chat from "../../models/chat/chatModel.js";
import User from "../../models/users/userModel.js";

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
          select: "name avatar",
        },
      })
      .exec();

    if (!userChats) {
      return res.status(200).json([]);
    }

    const formattedPayload = userChats.map((chat) => {
      const formattedMessages = chat.conversation.map((message) => ({
        _id: message._id,
        text: message.text,
        senderId: message.sender?._id,
        senderName: message.sender?.name,
        senderAvatar: message.sender?.avatar,
        receiverId: message.receiver?._id,
        receiverName: message.receiver?.name,
        receiverAvatar: message.sender?.avatar,
        timestamp: message.timestamp,
        isRead: message.isRead,
      }));

      const firstMessage = chat.conversation[0];
      const friendId =
        String(userId) === String(firstMessage?.sender?._id)
          ? firstMessage?.receiver?._id
          : firstMessage?.sender?._id;

      return {
        friendId,
        messages: formattedMessages,
      };
    });

    return res.status(200).json(formattedPayload);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getChatStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "Please provide user id" });
    }

    const userFound = await User.findOne({ _id: userId });

    if (!userFound) {
      return res.status(401).json({ message: "User not authorized" });
    }

    return res.status(200).json({ online: userFound?.online });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
