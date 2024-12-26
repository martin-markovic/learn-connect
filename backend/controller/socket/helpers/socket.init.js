const userSocketMap = new Map();

export const getUserSocketMap = () => userSocketMap;

export const setUserSocket = (userId, socketId) => {
  userSocketMap.set(userId, socketId);
  console.log(`Mapped userId ${userId} to socketId ${socketId}`);
};

export const removeUserSocket = (userId) => {
  userSocketMap.delete(userId);
  console.log(`Removed mapping for userId ${userId}`);
};

export const getUserSocket = (userId) => userSocketMap.get(userId);

export const createSocketContext = (socket, io) => ({
  socket,
  emitEvent: (targetId, event, data, ack) => {
    if (targetId === "sender") {
      socket.emit(
        event,
        data,
        ack && typeof ack === "function" ? ack : undefined
      );
    } else {
      const targetSocketId = getUserSocket(data?.receiverId);
      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (targetSocket) {
        targetSocket.emit(
          event,
          data,
          ack && typeof ack === "function" ? ack : undefined
        );
      } else if (ack && typeof ack === "function") {
        console.log(`Receiver with ID ${data.receiverId} is not connected.`);

        ack(null);
      }
    }
  },
});
