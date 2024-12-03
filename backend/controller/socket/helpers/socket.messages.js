import Chat from "../../../models/chat/chatModel.js";
import Conversation from "../../../models/chat/conversationModel.js";

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

  }




  io.emit("message delivered", savedMessage);



  }
};

  const message = await Chat.findByIdAndUpdate(
    messageId,
    { status: "seen" },
    { new: true }
  );
  if (!message) {
    socket.emit("error", {
      message: "Message not found",
    });

    return;
  }

  socket.emit("message seen", messageId);
};



    return;
  }
};
