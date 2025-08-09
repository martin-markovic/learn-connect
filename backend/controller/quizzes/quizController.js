export const getUserQuizzes = (User, Quiz) => async (req, res) => {
  try {
    const userId = req.user._id;

    const userFound = await User.findById(userId);

    if (!userFound) {
      throw {
        statusCode: 403,
        message: "User is not registered",
      };
    }

    const quizzes = await Quiz.find({ createdBy: userId });

    return res.status(200).json(quizzes || []);
  } catch (error) {
    console.error(
      `Error fetching quizzes for ${req.user._id}:  ${error.message}`
    );

    return res.status(error.statusCode || 500).json({
      message: `Error fetching quizzes: ${error.message}`,
    });
  }
};

export const getClassroomQuizzes = (User, Quiz) => async (req, res) => {
  try {
    const userId = req.user?._id;

    const userFound = await User.findById(userId);

    if (!userFound) {
      throw {
        statusCode: 403,
        message: "User is not registered",
      };
    }

    const userClassrooms = userFound?.classrooms;

    if (!userClassrooms.length) {
      return res.status(200).json([]);
    }

    const classroomIds = userClassrooms.map((classroom) => classroom._id);

    const quizPayload = await Quiz.find({ classroom: { $in: classroomIds } });

    return res.status(200).json(quizPayload || []);
  } catch (error) {
    console.error("Error in getQuizzesByClassroom:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: `Server error: ${error.message}` });
  }
};

export const updateQuiz = (User, Quiz) => async (req, res) => {
  try {
    const quizToUpdate = await Quiz.findById(req.params.id);

    if (!quizToUpdate) {
      throw {
        statusCode: 403,
        message: "Quiz not found",
      };
    }

    if (!req.user._id) {
      throw {
        statusCode: 403,
        message: "User id is required",
      };
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      throw {
        statusCode: 401,
        message: "User is unauthorized",
      };
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedQuiz) {
      throw {
        statusCode: 500,
        message: "Failed to update quiz",
      };
    }

    if (quizToUpdate.createdBy.toString() !== user._id) {
      throw {
        statusCode: 403,
        message: "Access denied, quiz does not belong to this user",
      };
    }

    return res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error(`Error updating quiz ${req.params.id}: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      message: error.message || `Error updating quiz ${req.params.id}`,
    });
  }
};

export const deleteQuiz = (User, Quiz) => async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      throw {
        statusCode: 404,
        message: "Quiz not found",
      };
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw {
        statusCode: 403,
        message: "User is not registered",
      };
    }

    if (quiz?.createdBy?.toString() !== user?._id) {
      throw {
        statusCode: 403,
        message: "Access denied, quiz does not belong to this user",
      };
    }

    await Quiz.findByIdAndDelete({ _id: req.params.id });

    return res.status(200).json({
      message: `Quiz ${req.params.id} successfully deleted`,
      _id: req.params.id,
    });
  } catch (error) {
    console.error(`Error deleting quiz ${req.params.id}: ${error.message}`);

    return res.status(error.statusCode || 500).json({
      message: `Error deleting quiz ${req.params.id}: ${error.message}`,
    });
  }
};
