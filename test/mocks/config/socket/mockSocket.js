export default class MockSocket {
  constructor() {
    this.subscriptions = {};
    this.eventHistory = {};
    this.socket = {
      userMap: socketUserMap,
      on: (eventName, eventHandler) => {
        this.subscriptions[eventName] = eventHandler;
      },
      emit: (eventName, eventData) => {
        this.eventHistory[eventName] = eventData;
      },
    };
    this.io = {
      sockets: this.socket.userMap,
    };
  }

  emitEvent(eventTarget, eventName, data) {
    try {
      if (eventTarget === "sender") {
        return this.socket.emit(eventName, data);
      }

      const { receiverId } = data;
      if (!receiverId) {
        throw new Error("Invalid receiver of the event: ", receiverId);
      }

      const targetSocketId = this.socket.userMap.get(receiverId);

      if (!targetSocketId) {
        throw new Error("Invalid receiver of the event: ", receiverId);
      }

      const targetSocket = this.io.sockets.get(targetSocketId);

      if (!targetSocket) {
        throw new Error(
          "Invalid socket instance: ",
          targetSocket,
          "for receiver: ",
          receiverId
        );
      }

      return targetSocket.emit(eventName, eventData);
    } catch (error) {
      console.error(`Error emitting event ${eventName}: ${error.message}`);
    }
  }

  resetHistory() {
    this.eventHistory = {};
  }

  connectUser(userId) {
    socketUserMap.set(userId, `socketId${userId}`);
  }

  disconnectUser(userId) {
    socketUserMap.delete(userId);
  }
}

const socketUserMap = new Map();
