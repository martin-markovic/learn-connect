export const joinClassroom = (Classroom, User) => async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      throw { statusCode: 400, message: "Classroom ID is required" };
    }

    const userId = req.user._id;

    if (!userId) {
      throw { statusCode: 403, message: "User id is required" };
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      throw { statusCode: 404, message: "Classroom not found" };
    }

    if (classroom.students.includes(userId)) {
      throw {
        statusCode: 400,
        message: "User is already in this classroom",
      };
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
      message: error.message || "Server error",
    });
  }
};

export const leaveClassroom = (Classroom, User) => async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      throw {
        statusCode: 400,
        message: "Please provide classroom ID",
      };
    }

    const userId = req.user._id || req.user.id;

    if (!userId) {
      throw {
        statusCode: 403,
        message: "User id is required",
      };
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      throw {
        statusCode: 404,
        message: "Classroom not found",
      };
    }

    if (!classroom.students.includes(userId)) {
      throw {
        statusCode: 403,
        message: "You are not a member of this classroom",
      };
    }

    classroom.students = classroom.students.filter(
      (studentId) => studentId !== userId
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
      message: error.message || "Server error",
    });
  }
};

export const getAllClassrooms = (Classroom) => async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      throw { statusCode: 403, message: "User is not registered" };
    }

    const classrooms = await Classroom.find();

    return res.status(200).json(classrooms);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
};

export const getUserClassroom = (Classroom) => async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      throw {
        statusCode: 403,
        message: "User id is required",
      };
    }

    const classroom = await Classroom.find({ students: user?._id });

    return res.status(200).json(classroom.length ? classroom[0] : null);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
};
