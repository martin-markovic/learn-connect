import Event from "../../models/socket/eventModel.js";
import { getUserSocket } from "./helpers/socket.init.js";

const handleAck = async (data, ack, ackResult) => {
  try {
    const { userId, eventName, payload } = data;

    if (!userId || !eventName || !payload) {
      throw new Error("Please provide valid event data");
    }

    if (ackResult === true) {
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

    if (ack && typeof ack === "function") {
      ack(ackResult);
    }
  } catch (error) {
    console.error("Error handling acknowledgement: ", error.message);
  }
};

const handleEmitEvent = async (data, ack) => {
  try {
    const { emitHandler, targetId, eventName, payload } = data;

    if (!emitHandler || !targetId || !eventName || !payload) {
      throw new Error("Please provide valid event emission data");
    }

    emitHandler(targetId, eventName, payload, async (ackResult) => {
      await handleAck(data, ack, ackResult);
    });
  } catch (error) {
    console.error("Error emitting event: ", error.message);
  }
};

const handleUserPresence = async (id, data, ack) => {
  try {
    const userOnline = getUserSocket(id);

    if (!userOnline) {
      const newEvent = new Event({
        user: data?.userId,
        eventName: data?.eventName,
        payload: data?.payload,
      });

      await newEvent.save();

      if (ack && typeof ack === "function") {
        ack(null);
      }

      return;
    }

    await handleEmitEvent(data, ack);
  } catch (error) {
    console.error("Error handling user presence: ", error.message);
  }
};

export default handleUserPresence;
