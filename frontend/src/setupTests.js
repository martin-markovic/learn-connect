import "@testing-library/jest-dom";

jest.mock("./features/socket/managers/socket.eventManager", () => {
  const callbacks = {};

  return {
    subscribe: jest.fn((eventName, cb) => {
      callbacks[eventName] = cb;
    }),
    unsubscribe: jest.fn(),
    handleEmitEvent: jest.fn(),
    _getCallbacks: () => callbacks,
  };
});
