import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "../../../pages/Dashboard";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const mockUser = {
  _id: "userId_1",
  avatar: "avatarImage.png",
  name: "John Doe",
};

const setupState = (stateProps) => {
  return { ...initialState, ...stateProps };
};

const initialAuthState = setupState({ user: mockUser });
const initialClassroomState = setupState({ classroomList: [] });
const initialNotificationState = setupState({ userNotifications: [] });
const initialFriendState = setupState({ userList: [] });
const initialQuizState = setupState({ userQuizzes: [], classQuizzes: [] });
const initialChatState = setupState({ online: true });

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...initialAuthState, ...initState }) => state,
      classroom: (state = { ...initialClassroomState, ...initState }) => state,
      notifications: (state = { ...initialNotificationState, ...initState }) =>
        state,
      friends: (state = { ...initialFriendState, ...initState }) => state,
      quizzes: (state = { ...initialQuizState, ...initState }) => state,
      chat: (state = { ...initialChatState, ...initState }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      // speeds up testing process, clears errors
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

const renderWithStore = (component, initStore) => {
  const store = createMockStore(initStore);

  return render(<Provider store={store}>{component}</Provider>);
};

describe("Dashboard component ", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();
  });

  afterAll(() => jest.useRealTimers());

  describe("should render", () => {
    it("user data", () => {
      renderWithStore(<Dashboard />, { user: mockUser });

      expect(screen.getByAltText("user avatar")).toBeInTheDocument();

      expect(screen.getByTitle("visit your profile")).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { level: 1, name: mockUser.name })
      ).toBeInTheDocument();

      expect(screen.getByTitle("visit your profile")).toBeInTheDocument();

      expect(screen.getByAltText("user avatar").src).toBe(
        `http://localhost/${mockUser.avatar}`
      );
    });

  });
});
