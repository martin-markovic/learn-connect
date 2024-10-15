import mongoose from "mongoose";
import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { classroom } = req.params;

    const { sender, text } = req.body.roomData;


    const userClassroom = await Classroom.findOne({ _id: classroom });

    if (!userClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Please provide message text." });
    }

    const isMember = userClassroom.students.includes(req.user._id);
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const newMessage = new Chat({
      classroom,
      sender,
      text,
      status: "delivered",
    });

    const savedMessage = await newMessage.save();

    await Classroom.findByIdAndUpdate(
      classroom,
      { $push: { chats: savedMessage._id } },
      { new: true }
    );

    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { classroom } = req.params;
    const userId = req.user._id;

    const userClassroom = await Classroom.findOne({ _id: classroom });

    if (!userClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (!userClassroom.students.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const classroomMessages = await Chat.find({ classroom: classroom })
      .populate("sender")
      .sort({ createdAt: -1 });

    return res.status(200).json(classroomMessages);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { classroomId, messageId } = req.params;

    if (!classroomId || !messageId) {
      return res
        .status(400)
        .json({ message: "Missing classroomId or messageId" });
    }

    const message = await Chat.findOne({
      _id: messageId,
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.status = "seen";

    await message.save();

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const removeMessages = async (req, res) => {
  const classroomId = req.params.classroom;
  const { messageIds } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!Array.isArray(messageIds) || !messageIds.length) {
      return res.status(400).json({ message: "Invalid message IDs provided." });
    }

    await Classroom.updateOne(
      { _id: classroomId },
      { $pull: { chats: { $in: messageIds } } },
      { session }
    );

    console.log(`Removed references to messages from classroom ${classroomId}`);

    console.log(`Deleted messages from chats collection: ${messageIds}`);

    await session.commitTransaction();

    await Chat.deleteMany({ _id: { $in: messageIds } }, { session });

    return res.status(200).json(classroomId);
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
