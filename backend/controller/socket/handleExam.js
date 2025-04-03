import { createExam, finishExam, updateExam } from "./helpers/socket.exam.js";

const handleExamEvents = (context) => {
  context.socket.on("create exam", async (data) => {
    await createExam(context, data);
  });

  context.socket.on("update exam", async (data) => {
    await updateExam(context, data);
  });

  context.socket.on("finish exam", async (data) => {
    await finishExam(context, data);
  });
};

export default handleExamEvents;
