export const createExam = async (models, eventData) => {
  try {
    const { Quiz, Classroom, Exam } = models;

    if (!Quiz || !Classroom || !Exam) {
      throw new Error("Missing models");
    }

    const { senderId, quizId } = eventData;

    if (!senderId) {
      throw new Error("User not authorized");
    }

    const quizFound = await Quiz.findOne({ _id: String(quizId) });

    if (!quizFound) {
      throw new Error("Quiz not found");
    }

    const classroomFound = await Classroom.findOne({
      _id: quizFound?.classroom,
    });

    if (!classroomFound) {
      throw new Error("Classroom not found");
    }

    const isEnrolled = classroomFound.students.some(
      (student) => String(student?._id) === String(senderId)
    );

    if (!isEnrolled) {
      throw new Error("User is not enrolled in required classroom");
    }

    const examExists = await Exam.findOne({ studentId: senderId });

    if (examExists) {
      throw new Error("User is already participating in an exam");
    }

    const examStart = new Date();
    const examFinish = new Date(
      examStart.getTime() + quizFound?.timeLimit * 60 * 1000
    );

    const newExam = new Exam({
      quizId: quizFound?._id,
      studentId: senderId,
      examStart,
      examFinish,
    });

    const payloadExam = await newExam.save();

    if (!payloadExam) {
      throw new Error("Database Failure: Unable to create new exam payload");
    }

    return payloadExam;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
