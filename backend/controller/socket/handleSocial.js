import Friend from "../../models/users/friendModel.js";

const handleSocialEvents = (socket, io) => {
  socket.on("send friend request", async (data) => {
    let errorMessage = null;
    try {
      const { senderId, receiverId } = data.roomData;

      if (!senderId || !receiverId) {
        errorMessage = "Please provide valid friend request data";

        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
      }

      const existingRequest = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId, status: "pending" },
          { sender: receiverId, receiver: senderId, status: "pending" },
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

      io.to(receiverId).emit("new friend request", newFriendRequest);
    } catch (error) {
      errorMessage = "Error processing friend request";

      console.error(errorMessage);
      socket.emit("error", errorMessage);
    }
  });

  socket.on("process friend request", async (data) => {
    let errorMessage = null;
    try {
      const { sender, friendReqResponse } = data.roomData;

      if (!friendReqResponse) {
        errorMessage = "Please provide valid room data";
        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
      }

      const validStatuses = ["pending", "accepted", "declined"];

      if (!validStatuses.includes(friendReqResponse)) {
        errorMessage = "Invalid friend request status";
        console.error(errorMessage);
        socket.emit("error", { errorMessage });
        return;
      }

      if (friendReqResponse === "declined") {
        const deletedRequest = await Friend.deleteOne({
          sender,
          status: "pending",
        });

        if (deletedRequest.deletedCount === 0) {
          errorMessage = "Friend request not found";
          console.error(errorMessage);
          socket.emit("error", { message: errorMessage });
          return;
        }

        socket.emit("friend request processed", {
          sender,
          status: "declined",
        });

        io.to(receiver).emit("friend request processed", {
          sender,
          status: "declined",
        });
        return;
      }

      const friendRequest = await Friend.findOneAndUpdate(
        { sender, status: "pending" },
        { status: friendReqResponse },
        { new: true }
      );

      if (!friendRequest) {
        errorMessage = "Friend request not found";
        console.error(errorMessage);
        socket.emit("error", { errorMessage });
        return;
      }

      socket.emit("friend request processed", friendRequest);
      io.to(receiver).emit("friend request processed", friendRequest);
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      socket.emit("error", { error });
    }
  });
};

export default handleSocialEvents;
