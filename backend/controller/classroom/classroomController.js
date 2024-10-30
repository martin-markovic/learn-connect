import Classroom from "../../models/classrooms/classroomModel.js";
import User from "../../models/users/userModel.js";

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

    await User.findByIdAndUpdate(
      userId,
      { $push: { classrooms: classroomId } },
      { new: true }
    );

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

    await User.findByIdAndUpdate(
      userId,
      { $pull: { classrooms: classroomId } },
      { new: true }
    );

    return res.status(200).json(classroomId);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find();

    return res.status(200).json(classrooms);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserClassrooms = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classrooms = await Classroom.find({ students: user._id });

    return res.status(200).json(classrooms);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
