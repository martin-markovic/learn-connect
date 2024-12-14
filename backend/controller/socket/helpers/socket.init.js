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
  emitToSender: (event, data) => socket.emit(event, data),
  emitToReceiver: (id, event, data) => io.to(id).emit(event, data),
});
