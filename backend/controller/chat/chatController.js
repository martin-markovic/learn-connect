import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

export const sendFriendMessage = async (req, res) => {
  try {
    const { receiverName, text } = req.body;

    const messageReceiver = await User.findOne({ username: receiverName });

    if (!messageReceiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const { commonClassroom } = await findCommonClassroom(
      req.user._id,
      messageReceiver._id
    );

    if (!commonClassroom) {
      return res
        .status(400)
        .json({ message: "No common classroom found between users" });
    }

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

export const joinClassroom = async (req, res) => {
  try {
    const { classroomId } = req.body;

    const userId = req.user._id;

    if (!classroomId) {
      return res.status(400).json({ message: "Classroom ID is required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.students.includes(userId)) {
      return res.status(400).json({ message: "User already in classroom" });
    }

    classroom.students.push(userId);
    await classroom.save();

    return res.status(200).json({
      message: "User joined classroom successfully",
      classroom,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const leaveClassroom = async (req, res) => {
  try {
    const { classroomId } = req.body;

    if (!classroomId) {
      return res.status(400).json({ message: "Please provide classroom ID" });
    }

    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (!classroom.students.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom" });
    }
    classroom.students = classroom.students.filter(
      (student) => !student.equals(userId)
    );

    await classroom.save();

    await Chat.deleteMany({ sender: userId, classroom: classroomId });

    return res.status(200).json({ message: "Successfully left the classroom" });
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

export const getClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();

    return res.status(200).json(classrooms);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
