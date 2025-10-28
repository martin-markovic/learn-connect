import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import UserNotifications from "../../../components/UserNotifications";
import {
  getNotifications,
  resetNotifications,
} from "../../../features/notifications/notificationSlice";



let consoleErrorSpy;

const mockHandleMark = jest.fn();
const mockHandleMarkAll = jest.fn();

const socketEventList = {
  "notification marked as read": mockHandleMark,
  "marked all as read": mockHandleMarkAll,
};

const mockSubscribe = jest.fn();
const mockUnSubscribe = jest.fn();
const mockEmitEvent = jest.fn();

jest.mock("../../../features/socket/managers/socket.eventManager.js", () => ({
  subscribe: jest.fn((eventName, handler) => mockSubscribe(eventName, handler)),
  unsubscribe: jest.fn((eventName) => mockUnSubscribe(eventName)),
  handleEmitEvent: jest.fn((eventName, data) => mockEmitEvent(eventName, data)),
}));

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const mockUser = { _id: "userId_1" };

jest.mock("../../../features/notifications/notificationSlice.js", () => ({
  resetNotifications: jest.fn(() => ({
    type: "notifications/resetNotifications",
  })),
  getNotifications: jest.fn(() => ({ type: "notifications/getNotifications" })),
  markNotificationAsRead: jest.fn((payload) => ({
    type: "notifications/markNotificationAsRead",
    payload,
  })),
}));

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { userNotifications: [] },
  reducers: {
    markNotificationAsRead: (state, action) => {
      state.userNotifications = state.userNotifications.filter(
        (n) => n._id !== action.payload
      );
    },
    resetNotifications: (state) => {
      state.userNotifications = [];
    },
  },
});

let dispatchedActions = [];

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...initialState, user: mockUser, ...initState.auth }) =>
        state,
      notifications: (
        state = { userNotifications: [], ...initState.notifications },
        action
      ) => notificationsSlice.reducer(state, action),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(() => (next) => (action) => {
        dispatchedActions.push(action);
        return next(action);
      }),
  });
};

const renderWithStore = (component, initStore) => {
  const store = createMockStore(initStore);

  const result = render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );

  return { ...result, store };
};

describe("User Notifications component", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchedActions = [];
    cleanup();
  });

  afterAll(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  describe("mount behavior", () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    describe("with authenticated user", () => {
      it("should render initial data", () => {
        const { container } = renderWithStore(<UserNotifications />);

        expect(screen.queryByText(/Mark all as read/i)).toBeInTheDocument();

        expect(
          container.querySelector(".notification-count")
        ).not.toBeInTheDocument();

        expect(
          container.querySelector(".notification-controller")
        ).not.toBeInTheDocument();
      });

      it("should dispatch getNotifications", () => {
        renderWithStore(<UserNotifications />);

        expect(dispatchedActions).toContainEqual({
          type: "notifications/getNotifications",
        });
      });

      it("should subscribe to socket notification events", () => {
        renderWithStore(<UserNotifications />);

        for (const [evtName] of Object.entries(socketEventList)) {
          expect(mockSubscribe).toHaveBeenCalledWith(
            evtName,
            expect.any(Function)
          );
        }
      });

      it("should attach document click listener on mount", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");

        renderWithStore(<UserNotifications />);
        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );

        addEventListenerSpy.mockRestore();
      });
    });

    describe("without authenticated user", () => {
      it("should render initial data", () => {
        const { container } = renderWithStore(<UserNotifications />, {
          auth: { user: null },
        });

        expect(screen.queryByText(/Mark all as read/i)).toBeInTheDocument();

        expect(
          container.querySelector(".notification-count")
        ).not.toBeInTheDocument();

        expect(
          container.querySelector(".notification-controller")
        ).not.toBeInTheDocument();
      });

      it("should not dispatch getNotifications", () => {
        renderWithStore(<UserNotifications />, {
          auth: { user: null },
        });

        expect(dispatchedActions).not.toContainEqual({
          type: "notifications/getNotifications",
        });
      });

      it("should not subscribe to socket notification events", () => {
        renderWithStore(<UserNotifications />, {
          auth: { user: null },
        });

        for (const [evtName] of Object.entries(socketEventList)) {
          expect(mockSubscribe).not.toHaveBeenCalledWith(
            evtName,
            expect.any(Function)
          );
        }
      });

      it("should not attach document click listener", () => {
        const addEventListenerSpy = jest.spyOn(document, "addEventListener");

        renderWithStore(<UserNotifications />, {
          auth: { user: null },
        });

        expect(addEventListenerSpy).not.toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );

        addEventListenerSpy.mockRestore();
      });
    });

    describe("notification list length indicator", () => {
      it("should not be rendered if list is empty", () => {
        const { container } = renderWithStore(<UserNotifications />, {
          auth: { user: mockUser },
          notifications: { userNotifications: [] },
        });

        expect(
          container.querySelector(".notification-count")
        ).not.toBeInTheDocument();
      });

      it("should be rendered if list is not empty", () => {
        const { container } = renderWithStore(<UserNotifications />, {
          auth: { user: mockUser },
          notifications: { userNotifications: [{ _id: "notificationId_1" }] },
        });

        expect(
          container.querySelector(".notification-count")
        ).toBeInTheDocument();
      });
    });
  });

  describe("unmount behavior", () => {
    it("should dispatch reset reducers", () => {
      const { unmount } = renderWithStore(<UserNotifications />);
      unmount();

      expect(dispatchedActions).toContainEqual({
        type: "notifications/resetNotifications",
      });
    });

    it("should unsubscribe to socket events", () => {
      const { unmount } = renderWithStore(<UserNotifications />);
      unmount();

      for (const [evtName] of Object.entries(socketEventList)) {
        expect(mockUnSubscribe).toHaveBeenCalledWith(evtName);
      }
    });
  });

  describe("interactive behavior", () => {
    it("should open and close notification list", () => {
      const { container } = renderWithStore(<UserNotifications />, {
        notifications: { userNotifications: [{ _id: "notificationId_1" }] },
      });

      const heading = container.querySelector(".notification-heading");
      fireEvent.click(heading);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).toBeInTheDocument();

      fireEvent.click(heading);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).not.toBeInTheDocument();
    });

    it("removes notification from DOM when it is marked as read", async () => {
      const mockNotification = { _id: "notificationId_1", message: "Test" };
      const { container, store } = renderWithStore(<UserNotifications />, {
        auth: { user: mockUser },
        notifications: { userNotifications: [mockNotification] },
      });

      expect(
        container.querySelector(".notification-count")
      ).toBeInTheDocument();

      store.dispatch(
        notificationsSlice.actions.markNotificationAsRead(mockNotification._id)
      );

      await screen.findByText(/Mark all as read/i);

      expect(
        container.querySelector(".notification-count")
      ).not.toBeInTheDocument();
    });

    it("should close notification list when clicking outside container", () => {
      const { container } = renderWithStore(<UserNotifications />, {
        notifications: {
          userNotifications: [{ _id: "notificationId_1", message: "Hello" }],
        },
      });

      const heading = container.querySelector(".notification-heading");
      fireEvent.click(heading);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).toBeInTheDocument();

      fireEvent.click(document.body);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).not.toBeInTheDocument();
    });

    it("should not close notification list when clicking inside container", () => {
      const { container } = renderWithStore(<UserNotifications />, {
        notifications: {
          userNotifications: [{ _id: "notificationId_1", message: "Hello" }],
        },
      });

      const heading = container.querySelector(".notification-heading");
      fireEvent.click(heading);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).toBeInTheDocument();

      const refContainer = container.querySelector(".notification-container");
      fireEvent.click(refContainer);

      expect(
        container.querySelector('[data-testid="notification-0"]')
      ).toBeInTheDocument();
    });

    describe("socket behavior", () => {
      it("should emit mark as read socket event on button click", () => {
        const mockNotification = { _id: "notificationId_1", message: "Test" };

        renderWithStore(<UserNotifications />, {
          notifications: {
            userNotifications: [mockNotification],
          },
        });

        fireEvent.click(screen.getByText(/Notifications/i));

        const btn = screen.queryByText(/Mark as read/i);

        fireEvent.click(btn);

        expect(mockEmitEvent).toHaveBeenCalledWith("mark as read", {
          senderId: mockUser?._id,
          notificationId: mockNotification._id,
        });
      });

      it("should emit mark all as read socket event on button click", () => {
        const mockNotification = { _id: "notificationId_1", message: "Test" };
        const mockNotification2 = {
          _id: "notificationId_2",
          message: "Test 2",
        };

        renderWithStore(<UserNotifications />, {
          notifications: {
            userNotifications: [mockNotification, mockNotification2],
          },
        });

        fireEvent.click(screen.getByText(/Notifications/i));

        const btn = screen.queryByText(/Mark all as read/i);

        fireEvent.click(btn);

        expect(mockEmitEvent).toHaveBeenCalledWith("mark all as read", {
          senderId: mockUser?._id,
        });
      });
    });
  });

});
