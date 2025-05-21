import Classroom from "../../models/classrooms/classroomModel.js";
import User from "../../models/users/userModel.js";

export const joinClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      throw new Error({ statusCode: 400, message: "Classroom ID is required" });
    }

    const userId = req.user._id;

    if (!userId) {
      throw new Error({ statusCode: 403, message: "User id is required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw new Error({ statusCode: 404, message: "Classroom not found" });
    }

    if (classroom.students.includes(userId)) {
      throw new Error({
        statusCode: 400,
        message: "User already in classroom",
      });
    }

    classroom.students.push(userId);
    const updatedClassroom = await classroom.save();

    await User.findByIdAndUpdate(
      userId,
      { $push: { classrooms: classroomId } },
      { new: true }
    );

    return res.status(200).json({
      message: "User joined classroom successfully",
      updatedClassroom,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

export const leaveClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      throw new Error({
        statusCode: 400,
        message: "Please provide classroom ID",
      });
    }

    const userId = req.user._id || req.user.id;

    if (!userId) {
      throw new Error({
        statusCode: 403,
        message: "User id is required",
      });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      throw new Error({
        statusCode: 404,
        message: "Classroom not found",
      });
    }

    if (!classroom.students.includes(userId)) {
      throw new Error({
        statusCode: 403,
        message: "You are not a member of this classroom",
      });
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
    return res.status(error.statusCode || 500).json({
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

export const getUserClassroom = async (req, res) => {
  try {
    const user = req.user;


    if (!user || !user._id) {
      throw new Error({
        statusCode: 403,
        message: "User id is required",
      });
    }

    const classroom = await Classroom.find({ students: user?._id });

    return res.status(200).json(classroom.length ? classroom[0] : null);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
