import { handleNewNotification } from "../handlers/handleNotifications.js";
import {
  handleNewRequest,
  handleProcessRequest,
  handleRemoveFriend,
  handleBlockUser,
} from "../controllers/socialControllers.js";
import User from "../../../models/users/userModel.js";
import Friend from "../../../models/users/friendModel.js";

const handleSocialEvents = (context) => {
  context.socket.on("send friend request", async (data) => {
    try {
      const friendRequestPayload = await handleNewRequest(Friend, data);

      if (!friendRequestPayload._id) {
        throw new Error("Unable to process new friend request");
      }

      context.emitEvent("sender", "friend request sent", friendRequestPayload);

      context.emitEvent(
        "receiver",
        "friend request received",
        friendRequestPayload
      );

      const userData = {
        senderId: data.senderId,
        receiverId: friendRequestPayload.receiverId,
        notificationName: "new friend request",
      };

      await handleNewNotification(context, userData);
    } catch (error) {
      console.error(error.message);
      context.socket.emit("error", error.message);
    }
  });

  context.socket.on("process friend request", async (data) => {
    try {
      const payload = await handleProcessRequest(Friend, data);

      if (!payload._id) {
        throw new Error("Unable to process request");
      }

      if (data.userResponse === "declined") {
        context.emitEvent("sender", "friend request declined", {
          _id: payload._id,
        });

        context.emitEvent("receiver", "friend request declined", {
          _id: payload._id,
          receiverId: payload.receiverId,
        });
      } else if (data.userResponse === "accepted") {
        context.emitEvent("sender", "friend request accepted", payload);

        context.emitEvent("receiver", "friend request accepted", payload);

        const userData = {
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          notificationName: "friend request accepted",
        };

        await handleNewNotification(context, userData);
      }
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      context.emitEvent("sender", "error", { message: error.message });
    }
  });

  context.socket.on("remove friend", async (data) => {
    try {
      const payloadId = await handleRemoveFriend(Friend, data);

      if (!payloadId) {
        throw new Error("Unable to process request");
      }

      context.emitEvent("sender", "friend removed", { _id: payloadId });

      context.emitEvent("receiver", "friend removed", {
        _id: payloadId,
        receiverId: data.receiverId,
      });
    } catch (error) {
      console.error("Error removing friend: ", error.message);
      context.emitEvent("sender", "error", error.message);
    }
  });

  context.socket.on("block user", async (data) => {
    try {
      const payloadId = await handleBlockUser(User, Friend, data);

      if (!payloadId) {
        throw new Error("Unable to process request");
      }

      context.emitEvent("sender", "user blocked", { _id: payloadId });

      context.emitEvent("receiver", "user blocked", {
        _id: payloadId,
        receiverId,
      });
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      context.emitEvent("sender", "error", error.message);
    }
  });
};

export default handleSocialEvents;
