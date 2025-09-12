import {
  handleCreateExam,
  handleUpdateExam,
} from "../handlers/handleExams.js";

const manageExamEvents = (context) => {
  context.socket.on("create exam", async (data) => {
    await handleCreateExam(context, data);
  });

  context.socket.on("update exam", async (data) => {
    await handleUpdateExam(context, data);
  });

  context.socket.on("finish exam", async (data) => {
    await finishExam(context, data);
  });
};

export default manageExamEvents;
