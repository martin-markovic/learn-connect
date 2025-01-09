import Friend from "../../models/users/friendModel.js";
import User from "../../models/users/userModel.js";

const handleSocialEvents = (context) => {
  context.socket.on("send friend request", async (data) => {
    try {
      const { senderId, receiverId, currentStatus } = data;

      if (!senderId || !receiverId) {
        throw new Error("Please provide valid friend request data");
      }

      const existingRequest = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId, status: currentStatus },
          { sender: receiverId, receiver: senderId, status: currentStatus },
        ],
      });

      if (existingRequest) {
        throw new Error("Friend request already pending");
      }

      const newRequest = new Friend({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
      });

      await newRequest.save();

      const populatedRequest = await Friend.findById(newRequest._id)
        .populate("sender", "name _id")
        .populate("receiver", "name _id");

      context.emitEvent("sender", "friend request sent", {
        id: populatedRequest._id.toString(),
        senderId,
        senderName: populatedRequest.sender?.name,
        receiverId,
        receiverName: populatedRequest.receiver?.name,
        status: populatedRequest.status,
      });

      context.emitEvent("receiver", "friend request received", {
        id: populatedRequest._id.toString(),
        senderId,
        senderName: populatedRequest.sender?.name,
        receiverId,
        receiverName: populatedRequest.receiver?.name,
        status: populatedRequest.status,
      });
    } catch (error) {
      console.error(error.message);
      context.socket.emit("error", error.message);
    }
  });

  context.socket.on("process friend request", async (data) => {
    try {
      const { senderId, receiverId, userResponse } = data;

      if (!senderId || !receiverId || !userResponse) {
        throw new Error("Please provide valid room data");
      }

      const validStatuses = ["accepted", "declined"];

      if (!validStatuses.includes(userResponse)) {
        throw new Error("Invalid friend request status");
      }

      if (userResponse === "declined") {
        const foundRequest = await Friend.findOne({
          sender: senderId,
          receiver: receiverId,
          status: "pending",
        });

        if (!foundRequest) {
          throw new Error("Friend request not found");
        }

        console.log("foundRequest: ", foundRequest);
        const payloadId = foundRequest?._id;

        await Friend.deleteOne({ _id: payloadId });

        context.emitEvent("sender", "friend request declined", {
          _id: payloadId,
        });

        context.emitEvent("receiver", "friend request declined", {
          _id: payloadId,
          receiverId: senderId,
        });

        return;
      }

      const friendRequest = await Friend.findOneAndUpdate(
        { sender: senderId, receiver: receiverId, status: "pending" },
        { status: userResponse },
        { new: true }
      );

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      context.emitEvent("sender", "friend request accepted", {
        _id: friendRequest?._id,
        status: userResponse,
      });

      context.emitEvent("receiver", "friend request accepted", {
        _id: friendRequest?._id,
        receiverId: senderId,
        status: userResponse,
      });
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      context.emitEvent("error", { message: error.message });
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
      console.log("Error removing friend: ", error.message);
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

      context.emitEvent("sender", "user blocked", { id: payloadId });

      context.emitEvent("receiver", "user blocked", {
        id: payloadId,
        receiverId,
      });
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      context.emitEvent("sender", "error", error.message);
    }
  });
};

export default handleSocialEvents;
