import schedule from "node-schedule";
import Exam from "../../../models/quizzes/examModel.js";
import Quiz from "../../../models/quizzes/quizModel.js";
import Classroom from "../../../models/classrooms/classroomModel.js";
import Score from "../../../models/quizzes/scoreModel.js";
import { handleNewNotification } from "./handleNotifications.js";
import {
  createExam,
  finishExam,
  updateExam,
} from "../controllers/examControllers.js";

export const handleCreateExam = async (context, data) => {
  try {
    if (!Quiz || !Classroom || !Exam) {
      throw new Error("Invalid models");
    }

    const models = { Quiz, Classroom, Exam };

    const payload = await createExam(models, data);

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

export const handleUpdateExam = async (context, data) => {
  try {
    if (!Exam) {
      throw new Error("Invalid models");
    }

    const models = { Exam };
    const payload = await updateExam(models, eventData);

    if (!payload) {
      throw new Error("Unable to update exam");
    }

    context.emitEvent("sender", "exam updated", payload);
  } catch (error) {
    console.error(`Error updating exam ${data?.receiverId}:  ${error.message}`);

    context.emitEvent("sender", "error", {
      message: `Error updating exam ${data?.receiverId}:  ${error.message}`,
    });
  }
};

export const handleFinishExam = async (context, data) => {
  try {
    if (!Exam || !Quiz || !Score) {
      throw new Error("Invalid models");
    }

    const models = { Exam, Quiz, Score };

    const examEndPayload = await finishExam(models, data);

    if (!examEndPayload.success) {
      throw new Error(examEndPayload?.message || "Unable to finish exam");
    }

    const ongoingJob = schedule.scheduledJobs[data?.senderId];

    if (ongoingJob) {
      ongoingJob.cancel();
    }

    context.emitEvent("sender", "exam finished", examEndPayload?.examPayload);

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
