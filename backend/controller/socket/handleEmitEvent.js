import Event from "../../models/socket/eventModel.js";

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
      if (ack) {
        await Event.findOneAndDelete({
          user: userId,
          eventName,
          payload,
        });

        return;
      }

          () => emitWithRetry(context, eventData, retries + 1),
          2000
        );
      }
    });
  } catch (error) {
    console.error("Error emitting event with retry: ", error.message);
  }
};

export default emitWithRetry;
