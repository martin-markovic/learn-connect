import User from "../../../models/users/userModel.js";
import Classroom from "../../../models/classrooms/classroomModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";

export const createQuiz = async (context, data) => {
  try {
    const { senderId, receiverId, quizData } = data;
    const { title, questions, timeLimit, classroomId } = quizData;

    if (
      !title ||
      !classroomId ||
      questions.length < 5 ||
      timeLimit < 3 ||
      timeLimit > 10
    ) {
      throw new Error("Please add all fields");
    }

    const userFound = await User.findById(senderId).populate("classrooms");

    if (!userFound) {
      throw new Error("User not found");
    }

    const isEnrolled = userFound?.classrooms.find(
      (c) => c._id.toString() === receiverId
    );

    if (!isEnrolled) {
      throw new Error(`User is not enrolled in the classroom ${receiverId}`);
    }

    const classroomFound = await Classroom.findById(receiverId);

    if (!classroomFound) {
      throw new Error("Classroom not found");
    }

    const quiz = await Quiz.create({
      title,
      questions,
      timeLimit,
      createdBy: senderId,
      classroom: receiverId,
    });

    context.emitEvent("sender", "new quiz created", quiz);
  } catch (error) {
    console.error("Error creating new quiz: ", error.message);
    context.emitEvent("sender", "error", {
      message: `Error creating a new message: ${error.message}`,
    });
  }
};
