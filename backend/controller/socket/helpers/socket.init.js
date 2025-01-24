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
  emitEvent: (targetId, eventName, data) => {
    if (targetId === "sender") {
      socket.emit(eventName, data);
    } else {
      const targetSocketId = getUserSocket(data?.receiverId);
      const targetSocket = io.sockets.sockets.get(targetSocketId);

      if (targetSocket) {
        targetSocket.emit(eventName, data);
      }
    }
  },
  broadcastEvent: (roomId, eventName, data) => {
    socket.broadcast.to(roomId).emit(eventName, data);
  },
});
