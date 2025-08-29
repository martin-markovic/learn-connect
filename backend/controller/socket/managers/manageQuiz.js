import { createQuiz } from "../handlers/handleQuiz.js";

const handleQuizEvents = (context) => {
  context.socket.on("submit quiz", async (data) => {
    await createQuiz(context, data);
  });
};

export default handleQuizEvents;
