import { handleNewNotification } from "./helpers/socket.notification.js";
import {
  handleNewRequest,
  handleProcessRequest,
} from "./helpers/socket.friendController.js";

const handleSocialEvents = (models, context) => {
  const { User, Friend } = models;

  if (!User) {
    throw new Error(
      "Invalid User model, aborting socket social events initialization."
    );
  }

  if (!Friend) {
    throw new Error(
      "Invalid Friend model, aborting socket social events initialization."
    );
  }

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
      const { senderId, receiverId } = data;

      if (!senderId || !receiverId) {
        throw new Error("Invalid user data");
      }

      const foundFriend = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      });

      if (!foundFriend) {
        throw new Error("Friend not found");
      }

      const payloadId = foundFriend?._id;

      await Friend.deleteOne({ _id: payloadId });

      context.emitEvent("sender", "friend removed", { _id: payloadId });

      context.emitEvent("receiver", "friend removed", {
        _id: payloadId,
        receiverId,
      });
    } catch (error) {
      console.error("Error removing friend: ", error.message);
      context.emitEvent("sender", "error", error.message);
    }
  });

  context.socket.on("block user", async (data) => {
    try {
      const { senderId, receiverId } = data;

      if (!senderId || !receiverId) {
        throw new Error("Please provide valid client data");
      }

      const userFound = await User.findOne({ _id: receiverId });

      if (!userFound) {
        throw new Error("User not found");
      }

      const payloadId = userFound?._id;

      const friendFound = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      });

      if (friendFound) {
        await Friend.findOneAndUpdate(
          {
            $or: [
              { sender: senderId, receiver: receiverId },
              { sender: receiverId, receiver: senderId },
            ],
          },
          { $set: { status: "blocked" } },
          { new: true }
        );
      } else {
        const blockedUser = new Friend({
          sender: senderId,
          receiver: receiverId,
          status: "blocked",
        });

        await blockedUser.save();
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
