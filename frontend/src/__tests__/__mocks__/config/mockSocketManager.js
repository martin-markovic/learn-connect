let callbacks = {};

const mockSubscribe = jest.fn((eventName, handler) => {
  if (callbacks[eventName]) return;

  callbacks[eventName] = handler;
});

const mockUnSubscribe = jest.fn((eventName) => {
  if (!callbacks[eventName]) return;

  delete callbacks[eventName];
});

const mockEmitEvent = jest.fn();

const resetCallbacks = () => {
  callbacks = {};
};

export { mockSubscribe, mockUnSubscribe, mockEmitEvent, resetCallbacks };

jest.mock("../../../features/socket/managers/socket.eventManager.js", () => ({
  subscribe: mockSubscribe,
  unsubscribe: mockUnSubscribe,
  handleEmitEvent: mockEmitEvent,
  resetCallbacks,
}));
