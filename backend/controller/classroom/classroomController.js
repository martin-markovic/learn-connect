import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

export const joinClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      return res.status(400).json({ message: "Classroom ID is required" });
    }

    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authorized" });
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
    const { classroomId } = req.params;

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

    return res
      .status(200)
      .json({ message: "Successfully left the classroom", classroomId });
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
