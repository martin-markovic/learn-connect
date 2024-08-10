import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";
import { findCommonClassroom } from "../../utils/chat/chatUtils.js";

export const sendFriendMessage = async (req, res) => {
  try {
    const { receiverName, text } = req.body;

    const { messageReceiver, commonClassroom } = await findCommonClassroom(
      req.user.id,
      receiverName
    );

    const newMessage = new Chat({
      sender: req.user._id,
      receiver: messageReceiver._id,
      text,
      classroom: commonClassroom._id,
    });

    await newMessage.save();

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const sendClassroomMessage = async (req, res) => {
  try {
    const { classroomId, text } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isMember = classroom.members.includes(req.user._id);
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const newMessage = new Chat({
      sender: req.user._id,
      classroom: classroom._id,
      text,
    });

    await newMessage.save();

    return res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const userMessages = await Chat.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).populate("sender receiver classroom");

    return res.status(200).json(userMessages);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getClassroomMessages = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const classroomMessages = await Chat.find({ classroom: classroomId })
      .populate("sender")
      .sort({ createdAt: -1 });

    return res.status(200).json(classroomMessages);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
