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
      exam: (state = { ...initialState, ...initState.exam }) => state,
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
    });
  });
});
