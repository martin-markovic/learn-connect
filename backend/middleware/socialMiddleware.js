import Friend from "../models/users/friendModel.js";

const validateFriendship = async (data, eventHandler) => {
  const { senderId, receiverId } = data;

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
    console.error("Unable to verify friendship: ", error.message);
  }
};

export default validateFriendship;
