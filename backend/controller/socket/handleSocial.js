import Friend from "../../models/users/friendModel.js";

const handleSocialEvents = (socket, io, userSocketMap) => {
  socket.on("send friend request", async (data) => {
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

  socket.on("process friend request", async (data) => {
    try {
      const { senderId, receiverId, userResponse } = data;

      if (!senderId || !receiverId || !userResponse) {
        throw new Error("Please provide valid room data");
      }

      const validStatuses = ["pending", "accepted", "declined"];

      if (!validStatuses.includes(userResponse)) {
        throw new Error("Invalid friend request status");
      }

        const deletedRequest = await Friend.deleteOne({
          sender: senderId,
          receiver: receiverId,
          status: "pending",
        });

        if (deletedRequest.deletedCount === 0) {
          errorMessage = "Friend request not found";
          console.error(errorMessage);
          socket.emit("error", { message: errorMessage });
          return;
        }

        socket.emit("friend request processed", {
          senderId,
          receiverId,
          status: "declined",
        });

        const targetSocketId = userSocketMap.get(senderId);

        if (!targetSocketId) {
          throw new Error(`No active socket for userId: ${targetSocketId}`);
        }
      }

      const friendRequest = await Friend.findOneAndUpdate(
        { sender: senderId, receiver: receiverId, status: "pending" },
        { status: userResponse },
        { new: true }
      );

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      socket.emit("friend request processed", friendRequest);
      const targetSocketId = userSocketMap.get(senderId);

      if (!targetSocketId) {
        throw new Error(`No active socket for user: ${targetSocketId}`);
      }
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      socket.emit("error", { message: error.message });
    }
  });
    }
  });
};

export default handleSocialEvents;
