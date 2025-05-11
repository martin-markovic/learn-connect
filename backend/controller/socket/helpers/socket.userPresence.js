import { getUserSocketMap } from "./socket.init.js";
import Friend from "../../../models/users/friendModel.js";

export const handleConnectionStatus = async (context, userData) => {
  const { userId, isOnline } = userData;

  const friendList = await Friend.find(
    {
      $or: [{ sender: userId }, { receiver: userId }],
    },
    "sender receiver"
  );

  const userMap = getUserSocketMap();

  const onlineList = new Set();

  friendList.forEach((entry) => {
    const senderId = entry.sender.toString();
    const receiverId = entry.receiver.toString();

    if (userMap.has(senderId) && senderId !== userId.toString()) {
      onlineList.add(senderId);
    }

    if (userMap.has(receiverId) && receiverId !== userId.toString()) {
      onlineList.add(receiverId);
    }
  });

  const payloadList = Array.from(onlineList);

  if (isOnline) {
    context.emitEvent("sender", "user connected", { payloadList });

    payloadList.forEach((onlineUser) => {
      context.emitEvent("receiver", "friend connected", {
        id: userId,
        receiverId: onlineUser,
      });
    });
  } else {
    payloadList.forEach((onlineUser) => {
      context.emitEvent("receiver", "friend disconnected", {
        id: userId,
        receiverId: onlineUser,
      });
    });
  }
};
