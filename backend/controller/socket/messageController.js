import {
  sendMessage,
  handleStatusUpdate,
  handleTyping,
} from "./helpers/socket.messages.js";
import validateFriendship from "../../middleware/socialMiddleware.js";

const handleMessages = (context) => {
  context.socket.on("send message", (data, ack) => {
    try {
      validateFriendship(data, async () => {
        await sendMessage(context, data, ack);
      });

      if (ack && typeof ack === "function") {
        ack(true);
      } else {
        throw new Error("Please provide acknowledgement function");
      }
    } catch (error) {
      console.error("Error emitting send message event: ", error.message);
    }
  });

  context.socket.on("user typing", (data) => {
    try {
      validateFriendship(data, async () => {
        await handleTyping(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });

  context.socket.on("status update", async (data) => {
    try {
      console.log("passing on data: ", data);
      validateFriendship(data, async () => {
        await handleStatusUpdate(context, data);
      });
    } catch (error) {
      console.error("Error emitting user typing event: ", error.message);
    }
  });
};

export default handleMessages;
