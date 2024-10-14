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

export const sendClassroomMessage = async (req, res) => {
  try {
    const { classroomId, text } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isMember = classroom.students.includes(req.user._id);
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
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (!classroom.students.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }

    const classroomMessages = await Chat.findOne({ classroom: classroomId })
      .populate("sender")
      .sort({ createdAt: -1 });

    return res.status(200).json(classroomMessages);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
