import handleCreateQuiz from "../handlers/handleQuiz.js";

const handleQuizEvents = (context) => {
  context.socket.on("submit quiz", async (data) => {
    try {
      await handleCreateQuiz(context, data);
    } catch (error) {
      const errorMessage = `Error submitting quiz: ${
        error.message || "Server error"
      }`;

      console.error(errorMessage);

      context.socket.emitEvent("sender", "error", { message: errorMessage });
    }
  });
};

export default handleQuizEvents;
