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

export const finishExam = async (models, data) => {
  try {
    const { Exam, Quiz, Score } = models;

    if (!Exam || !Quiz || !Score) {
      throw new Error("Missing models");
    }
    const { senderId, quizId } = data;

    const examFound = await Exam.findOne({ studentId: senderId });

    if (!examFound) {
      throw new Error("Exam not found");
    }

    const examQuestions = examFound?.shuffledQuestions;

    const examIsValid = examFound?.examFinish?.getTime() - Date.now() > 0;

    if (!examIsValid) {
      throw new Error("Exam not found");
    }

    await Exam.findByIdAndUpdate(
      examFound?._id,
      { isInProgress: false },
      { new: true }
    );

    const quizFound = await Quiz.findOne({ _id: quizId });

    if (!quizFound) {
      throw new Error("Cannot evaluate exam, no matching quiz found");
    }

    let currentScore = 0;

    let userChoices = [];

    for (let i = 0; i < quizFound?.questions?.length; i++) {
      const q = quizFound?.questions[i];

      if (q.answer === examFound?.answers[i]) {
        currentScore += 1;
      }

      userChoices[i] = {
        userAnswer: examFound?.answers?.[i],
        correctAnswer: q.answer,
      };
    }

    const scoreFound = await Score.findOne({
      user: senderId,
      "quiz.quizId": quizFound?._id,
    });

    let scorePayload;

    if (scoreFound) {
      scorePayload = await Score.findByIdAndUpdate(
        scoreFound?._id,
        {
          $set: {
            "examFeedback.userChoices": userChoices,
            "examFeedback.randomizedQuestions": examQuestions,
            highScore: Math.max(scoreFound.highScore, currentScore),
            latestScore: currentScore,
          },
        },
        { new: true }
      );
    } else {
      scorePayload = await new Score({
        user: senderId,
        quiz: {
          quizId: quizFound._id,
          quizTitle: quizFound.title,
        },
        examFeedback: {
          userChoices,
          randomizedQuestions: examQuestions,
        },
        highScore: currentScore,
        latestScore: currentScore,
      }).save();
    }

    const examPayload = { examId: examFound?._id, scorePayload };

    await Exam.findByIdAndDelete(examFound?._id);

    return { success: true, examPayload };
  } catch (error) {
    console.error(`Error creating exam payload: ${error.message}`);
    return { success: false, message: `Error finishing exam ${error.message}` };
  }
};
