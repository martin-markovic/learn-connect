import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
