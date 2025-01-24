import Exam from "../../../models/quizzes/examModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";
import Score from "../../../models/quizzes/scoreModel.js";

export const updateExam = async (context, data) => {
  try {
    const { senderId, examData } = data;

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
      throw new Error("Exam not found");
    }

    context.emitEvent("sender", "exam updated", updatedExam);
  } catch (error) {
    console.error(`Error updating exam ${data?.receiverId}:  ${error.message}`);

    context.emitEvent("sender", "error", {
      message: `Error updating exam ${data?.receiverId}:  ${error.message}`,
    });
  }
};

export const finishExam = async (context, data) => {
  try {
    const { senderId, receiverId } = data;

    const examFound = await Exam.findOne({ studentId: senderId });

    if (!examFound) {
      throw new Error("Exam not found");
    }

    const examIsValid = examFound?.examFinish.getTime() - Date.now();

    if (!examIsValid) {
      throw new Error("Exam has expired");
    }

    const quizFound = await Quiz.findOne({ quizId: receiverId });

    if (!quizFound) {
      throw new Error("Cannot evaluate exam, no matching quiz found");
    }

    let payloadScore = 0;

    const examFeedback = [];

    for (let i = 0; i < quizFound.questions.length; i++) {
      const q = quizFound.questions[i];

      if (q.answer === examFound.answers[i]) {
        payloadScore += 1;
      }

      examFeedback[i] = {
        userAnswer: examFound.answers[i],
        correctAnswer: q.answer,
      };
    }

    const scoreFound = await Score.findOne({
      user: senderId,
      quiz: quizFound?._id,
    });

    let scorePayload;

    if (scoreFound) {
      scorePayload = await Score.findByIdAndUpdate(
        scoreFound?._id,
        {
          $set: {
            examFeedback,
            highScore: Math.max(scoreFound.highScore, payloadScore),
          },
        },
        { new: true }
      );
    } else {
      const newScore = new Score({
        user: senderId,
        quiz: quizFound?._id,
        examFeedback,
        highScore: payloadScore,
      });

      payloadScore = await newScore.save();
    }

    context.emitEvent("sender", "exam finished", scorePayload);
  } catch (error) {
    console.error(
      `Error finishing exam ${data?.receiverId}:  ${error.message}`
    );

    context.emitEvent("sender", "error", {
      message: `Error finishing exam ${data?.receiverId}:  ${error.message}`,
    });
  }
};
