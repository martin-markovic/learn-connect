const userSocketMap = new Map();

export const getUserSocketMap = () => userSocketMap;

export const setUserSocket = (userId, socketId) => {
  if (!userId || !socketId) {
    throw new Error("Both userId and socketId are required");
  }
  if (typeof userId !== "string" || typeof socketId !== "string") {
    throw new Error("user and socket must be strings");
  }

  userSocketMap.set(userId, socketId);
  console.log(`Mapped userId ${userId} to socketId ${socketId}`);
};

export const removeUserSocket = (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const existed = userSocketMap.delete(userId);
  if (existed) {
    console.log(`Removed mapping for userId ${userId}`);
  }

  return existed;
};

export const getUserSocket = (userId) => userSocketMap.get(userId);

export const createSocketContext = (socket, io) => {
  if (!socket || !io) {
    throw new Error("Both socket and io instances are required");
  }

  return {
    socket,
    emitEvent: (targetId, eventName, data) => {
      try {
        if (targetId === "sender") {
          socket.emit(eventName, data);
        } else {
          const targetSocketId = getUserSocket(data?.receiverId);

          if (!targetSocketId) {
            console.warn(
              `No socket found for the receiverId ${receiverId} of the event ${eventName}`
            );

            return false;
          }

          const targetSocket = io.sockets.sockets.get(targetSocketId);

          if (!targetSocket) {
            console.warn(`Socket ${targetSocketId} not found in io.sockets`);

            return false;
          }

          targetSocket.emit(eventName, data);
        }
      } catch (error) {
        console.error(`Failed to emit the event ${eventName}: `, error.message);

        return false;
      }
    },
  };
};
