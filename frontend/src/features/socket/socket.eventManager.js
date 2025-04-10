class EventManager {
  constructor(socketInstance) {
    this.socket = socketInstance;
    this.events = {};
    this.pendingSubscriptions = [];
  }

  setSocketInstance(socketInstance) {
    if (!socketInstance) {
      console.error("Socket instance is not available");
      this.socket = null;
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

      if (
        !this.pendingSubscriptions.some(
          (sub) => sub.event === event && sub.listener === listener
        )
      ) {
        this.pendingSubscriptions.push({ event, listener });
      }
      return;
    }

    if (this.events[event] === listener) {
      console.error(`Listener for event ${event} is already subscribed.`);
      return;
    }

    this.unsubscribe(event);

    this.events[event] = listener;
    this.socket.on(event, listener);
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
