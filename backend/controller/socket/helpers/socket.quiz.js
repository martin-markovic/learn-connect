import User from "../../../models/users/userModel.js";
import Classroom from "../../../models/classrooms/classroomModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";

export const createQuiz = async (context, data) => {
  try {
    const { title, questions, timeLimit, classroomId } = data;

    if (
      !title ||
      !classroomId ||
      questions.length < 5 ||
      timeLimit < 3 ||
      timeLimit > 10
    ) {
      throw new Error("Please add all fields");
    }

    const user = await User.findById(req.user.id).populate("classrooms");

    if (!user) {
      throw new Error("User not found");
    }

    const classroom = user.classrooms.find(
      (c) => c._id.toString() === classroomId
    );

    if (!classroom) {
      throw new Error("User not enrolled in the specified classroom");
    }

    const classroomExists = await Classroom.findById(classroomId);
    if (!classroomExists) {
      throw new Error("Classroom not found");
    }

    const quiz = await Quiz.create({
      title,
      questions,
      timeLimit,
      user: req.user.id,
      classroom: classroomId,
    });

    context.emitEvent("sender", "new quiz created", quiz);

  } catch (error) {
    console.log("Error creating new quiz: ", error.message);
    context.emitEvent("sender", "error", {
      message: `Error creating a new message: ${error.message}`,
    });
  }
};
