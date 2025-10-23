import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider, useDispatch } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import UserNotifications from "../../../components/UserNotifications";

const mockDispatch = jest.fn();

jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

const mockHandleMark = jest.fn();
const mockHandleMarkAll = jest.fn();

const socketEventList = {
  "notification marked as read": mockHandleMark,
  "marked all as read": mockHandleMarkAll,
};

const mockSubscribe = jest.fn();
const mockUnSubscribe = jest.fn();

jest.mock("../../../features/socket/managers/socket.eventManager.js", () => ({
  subscribe: jest.fn((eventName, handler) => mockSubscribe(eventName, handler)),
  unsubscribe: jest.fn((eventName) => mockUnSubscribe(eventName)),
}));

const mockResetNotifications = jest.fn();
const mockGetNotifications = jest.fn();
const mockMarkNotificationAsRead = jest.fn();

jest.mock("../../../features/notifications/notificationSlice.js", () => ({
  resetNotifications: () => mockResetNotifications,
  getNotifications: () => mockGetNotifications,
  markNotificationAsRead: () => mockMarkNotificationAsRead,
}));

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const mockUser = { _id: "userId_1" };

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...initialState, user: mockUser, ...initState.auth }) =>
        state,
      notifications: (
        state = {
          ...initialState,
          notifications: [],
          ...initState.notifications,
        }
      ) => state,
    },
  });
};

const renderWithStore = (component, initStore) => {
  const store = createMockStore(initStore);

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe("User Notifications component", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("mount behavior", () => {
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

        expect(mockDispatch).toHaveBeenCalledWith(mockGetNotifications);
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

        expect(mockDispatch).not.toHaveBeenCalledWith(mockGetNotifications);
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

      expect(mockDispatch).toHaveBeenCalledWith(mockResetNotifications);
    });
  });

});
