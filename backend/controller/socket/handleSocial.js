import Friend from "../../models/users/friendModel.js";

const handleSocialEvents = (socket, io, userSocketMap) => {
  socket.on("send friend request", async (data) => {
    let errorMessage = null;

    try {
      const { senderId, receiverId, currentStatus } = data;

      if (!senderId || !receiverId) {
        errorMessage = "Please provide valid friend request data";

        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
      }

      const existingRequest = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId, status: currentStatus },
          { sender: receiverId, receiver: senderId, status: currentStatus },
        ],
      });

      if (existingRequest) {
        errorMessage = "Friend request already pending";

        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
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
        console.log(`Friend request sent to userId ${targetSocketId}`);
      } else {
        console.error(`No active socket for userId: ${targetSocketId}`);
      }
    } catch (error) {
      console.error(error.message);
      socket.emit("error", error.message);
    }
  });

  socket.on("process friend request", async (data) => {
    let errorMessage = null;
    try {
      const { senderId, receiverId, userResponse } = data;

      if (!userResponse) {
        errorMessage = "Please provide valid room data";
        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
      }

      const validStatuses = ["pending", "accepted", "declined"];

      if (!validStatuses.includes(userResponse)) {
        errorMessage = "Invalid friend request status";
        console.error(errorMessage);
        socket.emit("error", { errorMessage });
        return;
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
        if (targetSocketId) {
          io.to(targetSocketId).emit("friend request processed", {
            senderId,
            receiverId,
            status: "declined",
          });

          console.log(`Friend request declined for userId: '${targetSocketId}`);
          return;
        } else {
          console.error(`No active socket for userId: ${targetSocketId}`);
        }
      }

      const friendRequest = await Friend.findOneAndUpdate(
        { sender: senderId, receiver: receiverId, status: "pending" },
        { status: userResponse },
        { new: true }
      );

      if (!friendRequest) {
        errorMessage = "Friend request not found";
        console.error(errorMessage);
        socket.emit("error", { errorMessage });
        return;
      }

      socket.emit("friend request processed", friendRequest);
      const targetSocketId = userSocketMap.get(senderId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friend request processed", friendRequest);
        console.log(`Friend request sent to userId ${targetSocketId}`);
      } else {
        console.log(`No active socket for userId: ${targetSocketId}`);
      }
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      socket.emit("error", { error });
    }
  });
};

export default handleSocialEvents;
