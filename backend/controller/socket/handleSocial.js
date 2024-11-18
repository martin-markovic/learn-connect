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
      }

      const existingRequest = await Friend.findOne({
        $or: [
          { sender: senderId, receiver: receiverId, status: "pending" },
          { sender: receiverId, receiver: senderId, status: "pending" },
        ],
      });

      if (!existingRequest) {
        errorMessage = "Friend request already pending";
        console.error(errorMessage);

        socket.emit("error", { message: errorMessage });
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
};

export default handleSocialEvents;
