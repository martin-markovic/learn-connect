import deleteEventForUser from "./helpers/socket.deleteEvent.js";

const MAX_RETRIES = 3;

const emitWithRetry = async (context, eventData, retries = 0) => {
  try {
    const { eventName, payload, userId } = eventData;

    if (!eventName || !payload || !userId) {
      throw new Error("Please provide valid event data");
    }

    const emitFunction =
      context.to && typeof context.to === "function"
        ? context.to(userId).emit
        : context.emit;

    let timeout;

    emitFunction(eventName, payload, async (ack) => {
      if (!ack && retries < MAX_RETRIES) {
        timeout = setTimeout(
          () => emitWithRetry(context, eventData, retries + 1),
          2000
        );
      } else if (ack) {
        clearTimeout(timeout);

        await deleteEventForUser(userId, eventName, payload);
      }
    });
  } catch (error) {
    console.error("Error emitting event with retry: ", error.message);
  }
};

export default emitWithRetry;
