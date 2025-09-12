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

export const updateExam = async (models, eventData) => {
  try {
    const { Exam } = models;

    if (!Exam) {
      throw new Error("Missing models");
    }

    const { senderId, examData } = eventData;

    if (!examData) {
      throw new Error("Please provide valid exam data");
    }

    const examFound = await Exam.findOne({ studentId: senderId });

    if (!examFound) {
      throw new Error("Exam not found");
    }

    const examIsValid = examFound?.examFinish.getTime() - Date.now();

    if (!examIsValid) {
      throw new Error("Exam has expired");
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examFound?._id,
      {
        $set: { [`answers.${examData?.choiceIndex}`]: examData?.choiceData },
      },
      { new: true }
    );

    if (!updatedExam) {
      throw new Error("Database failure: unable to update exam");
    }

    return updatedExam;
  } catch (error) {
    console.error("update exam error: ", error.message);
    throw new Error("update exam error: ", error.message);
  }
};
