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

      socket.emit("friend request sent", newRequest);

      const targetSocketId = userSocketMap.get(receiverId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("new friend request", newRequest);
      } else {
        throw new Error(`No active socket for userId: ${targetSocketId}`);
      }
    } catch (error) {
      console.error(error.message);
      socket.emit("error", error.message);
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

        const payloadId = foundRequest._id;

        await Friend.deleteOne({ _id: payloadId });

        socket.emit("friend request declined", {
          payloadId,
        });

        const targetSocketId = userSocketMap.get(senderId);

        if (!targetSocketId) {
          throw new Error(`No active socket for userId: ${targetSocketId}`);
        }

        io.to(targetSocketId).emit("friend request declined", {
          payloadId,
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

      socket.emit("friend request accepted", friendRequest);

      const targetSocketId = userSocketMap.get(senderId);

      if (!targetSocketId) {
        throw new Error(`No active socket for user: ${targetSocketId}`);
      }

      io.to(targetSocketId).emit("friend request accepted", friendRequest);
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      socket.emit("error", { message: error.message });
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

      await Friend.deleteOne({ _id: foundFriend?._id });

      socket.emit("friend removed", { payloadId: foundFriend?._id });
      const targetSocketId = userSocketMap.get(receiverId);

      if (!targetSocketId) {
        throw new Error(`No active socket for userId: ${targetSocketId}`);
      }

      io.to(targetSocketId).emit("friend removed", {
        payloadId: foundFriend?._id,
      });
    } catch (error) {
      console.log("Error removing friend: ", error.message);
      socket.emit("error", { message: error.message });
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

      socket.emit("user blocked", { payloadId });

      const targetSocketId = userSocketMap.get(receiverId);

      if (!targetSocketId) {
        throw new Error(`No active socket for user: ${targetSocketId}`);
      }

      io.to(targetSocketId).emit("user blocked", { payloadId });
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      socket.emit("error", { message: error.message });
    }
  });
};

export default handleSocialEvents;
