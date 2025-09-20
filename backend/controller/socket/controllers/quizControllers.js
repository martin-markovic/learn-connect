export const createQuiz = async (models, eventData) => {
  try {
    const { User, Classroom, Quiz } = models;

    if (!User || !Classroom || !Quiz) {
      throw new Error("Missing models");
    }

    const { senderId, receiverId, quizData } = eventData;

    if (!senderId) {
      throw new Error("User not authorized");
    }

    if (!receiverId) {
      throw new Error("Classroom id is required");
    }

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

    const userFound = await User.findById(senderId);

    if (!userFound || !userFound._id) {
      throw new Error("User not found");
    }

    userFound.populate("classrooms");

    const classroomFound = await Classroom.findById(receiverId);

    if (!classroomFound) {
      throw new Error("Classroom not found");
    }

    const isEnrolled = userFound?.classrooms.find(
      (c) => c?._id.toString() === receiverId
    );

    if (!isEnrolled) {
      throw new Error(`User is not enrolled in the classroom ${receiverId}`);
    }

    const newQuiz = await Quiz.create({
      title,
      questions,
      timeLimit,
      createdBy: senderId,
      classroom: receiverId,
    });

    if (!newQuiz || !newQuiz._id) {
      throw new Error("Database failure: unable to create a new quiz");
    }

    return newQuiz;
  } catch (error) {
    const errorMessage = `Error creating new quiz: ${
      error.message || "Server error"
    }`;

    console.error(errorMessage);

    throw new Error(errorMessage);
  }
};
