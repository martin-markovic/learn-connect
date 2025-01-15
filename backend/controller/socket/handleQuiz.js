import { createQuiz } from "./helpers/socket.quiz.js";

const handleQuizEvents = (context) => {
  context.socket.on("submit quiz", async (data) => {
    await createQuiz(context, data);
  });

};

export default handleQuizEvents;
