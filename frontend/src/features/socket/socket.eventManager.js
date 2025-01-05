class EventManager {
  constructor(socketInstance) {
    this.socket = socketInstance;
    this.events = {};
    this.pendingSubscriptions = [];
  }

  setSocketInstance(socketInstance) {
    if (!socketInstance) {
      console.error("Socket instance is not available");
      return;
    }

    this.socket = socketInstance;

    this.pendingSubscriptions.forEach(({ event, listener }) => {
      this.subscribe(event, listener);
    });
    this.pendingSubscriptions = [];
  }

  subscribe(event, listener) {
    if (!this.socket) {
      console.warn(
        `Socket not initialized. Queuing subscription for event: ${event}`
      );

      this.pendingSubscriptions.push({ event, listener });
      return;
    }

    this.socket.on(event, listener);
    this.events[event] = listener;
  }

  unsubscribe(event) {
    if (!this.socket) {
      console.error(`Socket instance is not available for event: ${event}`);
      return;
    }

    if (!this.events[event]) {
      console.error(`Event ${event} is not registered.`);
      return;
    }

    this.socket.off(event);
    delete this.events[event];
  }

  handleEmitEvent(event, data) {
    if (!this.socket) {
      console.error("Socket instance is not available");
      return;
    }

    this.socket.emit(event, data);
  }
}

const socketEventManager = new EventManager();

export default socketEventManager;
