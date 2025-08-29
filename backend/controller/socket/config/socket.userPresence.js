import { getUserSocketMap } from "./socket.init.js";
import Friend from "../../../models/users/friendModel.js";
import User from "../../../models/users/userModel.js";

export const handleConnectionStatus = async (
  context,
  userId,
  connectionStatus
) => {
  try {
    if (!userId) {
      throw new Error("User id not found");
    }

    const userFound = await User.findOne({ _id: userId });

    if (!userFound) {
      throw new Error("User is not authorized");
    }

    const currentStatus = userFound?.online;

    if (
      connectionStatus === "connected" ||
      connectionStatus === "reconnected"
    ) {
      if (!currentStatus) return;

      const payloadList = await getOnlineList(userId);

      context.emitEvent("sender", "user connected", { payloadList });

      payloadList.forEach((onlineUser) => {
        context.emitEvent("receiver", "friend connected", {
          id: userId,
          receiverId: onlineUser,
        });
      });
    }

    if (connectionStatus === "disconnected" || connectionStatus === "offline") {
      if (!currentStatus && connectionStatus === "disconnected") return;

      const payloadList = await getOnlineList(userId);

      payloadList.forEach((onlineUser) => {
        context.emitEvent("receiver", "friend disconnected", {
          id: userId,
          receiverId: onlineUser,
        });
      });
    }
  } catch (error) {
    console.error("Error changing user connection status: ", error.message);
    context.emitEvent("sender", "error", { message: error.message });
  }
};

const getOnlineList = async (userId) => {
  const friendList = await Friend.find(
    {
      $or: [{ sender: userId }, { receiver: userId }],
    },
    "sender receiver"
  )
    .populate("sender", "online")
    .populate("receiver", "online");

  const onlineList = new Set();

  friendList.forEach((entry) => {
    const senderId = entry.sender._id.toString();
    const receiverId = entry.receiver._id.toString();

    const userSocketMap = getUserSocketMap();

    if (
      entry.sender.online &&
      senderId.toString() !== userId.toString() &&
      userSocketMap.has(senderId)
    ) {
      onlineList.add(senderId);
    }

    if (
      entry.receiver.online &&
      receiverId.toString() !== userId.toString() &&
      userSocketMap.has(receiverId)
    ) {
      onlineList.add(receiverId);
    }
  });

  return Array.from(onlineList);
};
