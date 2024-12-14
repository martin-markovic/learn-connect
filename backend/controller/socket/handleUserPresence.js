import Event from "../../models/socket/eventModel.js";
import { getUserSocket } from "./helpers/socket.init.js";

const handleEmitEvent = async (data) => {
  try {
    const { emitHandler, userId, eventName, payload } = data;

    console.log("data received: ", data);

    if (!emitHandler || !userId || !eventName || !payload) {
      throw new Error("Please provide valid event data");
    }

    emitHandler(eventName, payload, async (ack) => {
      if (ack) {
        await Event.findOneAndDelete({
          user: userId,
          eventName,
          payload,
        });
      } else {
        const newEvent = new Event({
          user: userId,
          eventName,
          payload,
        });

        await newEvent.save();
      }
    });
  } catch (error) {
    console.error("Error emitting event: ", error.message);
  }
};

const handleUserPresence = async (id, data) => {
  try {
    console.log(`received id ${id} and data ${data}`);
    const userOnline = getUserSocket(id);

    if (!userOnline) {
      const newEvent = new Event({
        user: userId,
        eventName,
        payload: data?.payload,
      });

      await newEvent.save();
      return;
    }

    await handleEmitEvent(data);
  } catch (error) {
    console.error("Error handling user presence: ", error.message);
  }
};

export default handleUserPresence;
