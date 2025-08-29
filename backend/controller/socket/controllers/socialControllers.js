export const handleNewRequest = async (Friend, data) => {
  try {
    const { senderId, receiverId } = data;

    if (!senderId || !receiverId) {
      throw new Error("Please provide valid friend request data");
    }

    const existingRequest = await Friend.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
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

    let populatedRequest = await Friend.findById(newRequest._id);

    populatedRequest = await populatedRequest.populate(
      "sender",
      "name _id avatar"
    );
    populatedRequest = await populatedRequest.populate(
      "receiver",
      "name _id avatar"
    );

    const friendRequestPayload = {
      _id: populatedRequest._id.toString(),
      senderId,
      senderName: populatedRequest.sender?.name,
      senderAvatar: populatedRequest?.sender?.avatar,
      receiverId,
      receiverName: populatedRequest.receiver?.name,
      receiverAvatar: populatedRequest?.receiver?.avatar,
      status: populatedRequest.status,
    };

    return friendRequestPayload;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const handleProcessRequest = async (Friend, data) => {
  try {
    const { senderId, receiverId, userResponse } = data;

    if (!senderId || !receiverId || !userResponse) {
      throw new Error("Please provide valid request data");
    }

    const validStatuses = ["accepted", "declined"];

    if (!validStatuses.includes(userResponse)) {
      throw new Error("Invalid friend request status");
    }

    if (userResponse === "declined") {
      const foundRequest = await Friend.findOne({
        sender: receiverId,
        receiver: senderId,
        status: "pending",
      });

      if (!foundRequest) {
        throw new Error("Friend request not found");
      }

      const payloadId = foundRequest?._id;

      await Friend.deleteOne({ _id: payloadId });

      return { _id: payloadId };
    }

    const friendRequest = await Friend.findOneAndUpdate(
      { sender: receiverId, receiver: senderId, status: "pending" },
      { status: userResponse },
      { new: true }
    );

    if (!friendRequest) {
      throw new Error("Friend request not found");
    }

    const friendRequestPayload = {
      _id: friendRequest?._id,
      status: userResponse,
      receiverId,
      senderId,
    };

    return friendRequestPayload;
  } catch (error) {
    console.error("Error processing friend request: ", error.message);
    throw error;
  }
};

export const handleRemoveFriend = async (Friend, data) => {
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

    return payloadId;
  } catch (error) {
    console.error("Error removing friend: ", error.message);
    throw error;
  }
};

export const handleBlockUser = async (User, Friend, data) => {
  {
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

      return payloadId;
    } catch (error) {
      console.error("Error processing friend request: ", error.message);
      throw error;
    }
  }
};
