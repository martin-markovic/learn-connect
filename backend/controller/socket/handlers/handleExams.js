import schedule from "node-schedule";
import Exam from "../../../models/quizzes/examModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";
import Classroom from "../../../models/classrooms/classroomModel.js";
import Score from "../../../models/quizzes/scoreModel.js";
import { handleNewNotification } from "./handleNotifications.js";
import { createExam } from "../controllers/examControllers.js";

export const handleCreateExam = async (context, data) => {
  try {
    const models = { Quiz, Classroom, Exam };
    const payload = await createExam({ models, eventData: data });

    if (!payload._id) {
      throw new Error("Unable to create exam payload");
    }

    context.emitEvent("sender", "exam created", payload);

    const scheduledTime = examFinish - 1000;

    schedule.scheduleJob(senderId, scheduledTime, async () => {
      await finishExam(context, data);
    });
  } catch (error) {
    console.error(`Error creating exam:  ${error.message}`);

    context.emitEvent("sender", "error", {
      message: `Error creating exam:  ${error.message}`,
    });
  }
};

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
      throw new Error("Updated exam not found");
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
    const examEndPayload = await createExamPayload(data);

    if (!examEndPayload.success) {
      throw new Error(examEndPayload.message);
    }

    const ongoingJob = schedule.scheduledJobs[data?.senderId];

    if (ongoingJob) {
      ongoingJob.cancel();
    }

    context.emitEvent("sender", "exam finished", examEndPayload.examPayload);

    const notificationData = {
      senderId: data?.senderId,
      notificationName: "quiz graded",
      quizScore: examEndPayload?.examPayload?.scorePayload?.latestScore,
      quizId: examEndPayload?.examPayload?.scorePayload?.quiz?.quizId,
    };

    await handleNewNotification(context, notificationData);
  } catch (error) {
    console.error(error.message);
  }
};

export const createExamPayload = async (data) => {
  try {
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

    for (let i = 0; i < quizFound.questions.length; i++) {
      const q = quizFound.questions[i];

      if (q.answer === examFound.answers[i]) {
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

    await Exam.findByIdAndDelete({ _id: examFound?._id });

    return { success: true, examPayload };
  } catch (error) {
    console.error(`Error creating exam payload: ${error.message}`);
    return { success: false, message: `Error finishing exam ${error.message}` };
  }
};
