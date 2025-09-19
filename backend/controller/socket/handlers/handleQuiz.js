import User from "../../../models/users/userModel.js";
import Classroom from "../../../models/classrooms/classroomModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";

export const handleCreateQuiz = async (context, data) => {
  try {
    if (!User || !Classroom || !Quiz) {
      throw new Error("Invalid models");
    }

    const models = { User, Classroom, Quiz };

    const payload = await createQuiz(models, data);

    context.emitEvent("sender", "new quiz created", payload);
  } catch (error) {
    const errorMessage = `Error handling new quiz creation: ${
      error.message || "Server error"
    }`;

    console.error(errorMessage);

    throw new Error(errorMessage);
  }
};
