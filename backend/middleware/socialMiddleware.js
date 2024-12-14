import Friend from "../models/users/friendModel.js";

const validateFriendship = async (socket, eventHandler) => {
  const { senderId, receiverId } = socket.data;

  try {
    const isFriend = await Friend.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
      status: "accepted",
    });

    if (!isFriend) {
      throw new Error("Friendship validation failed");
    }

    eventHandler();
  } catch (error) {
    console.log("Friendship validation failed: ", error.message);
    socket.emit("error", { message: error.message });
  }
};

export default validateFriendship;
