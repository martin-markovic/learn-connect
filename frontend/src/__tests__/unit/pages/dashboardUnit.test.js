import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Dashboard from "../../../pages/Dashboard";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
}));

jest.mock("../../../components/classroom/Classroom.jsx", () => () => (
  <div data-testid="classroom-component">Mocked Classroom</div>
));

jest.mock("../../../components/friends/FriendSearch.jsx", () => () => (
  <div data-testid="friendsearch-component">Mocked FriendSearch</div>
));

jest.mock("../../../components/UserNotifications.jsx", () => () => (
  <div data-testid="notifications-component">Mocked Notifications</div>
));

jest.mock("../../../components/chat/Chat.jsx", () => () => (
  <div data-testid="chat-container">Mocked Chat</div>
));

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

    it("fallback avatar icon", () => {
      const noAvatarUser = { ...mockUser, avatar: null };
      renderWithStore(<Dashboard />, { user: noAvatarUser });

      const fallbackIcon = screen.getByTitle(/visit your profile/i);
      expect(fallbackIcon).toBeInTheDocument();
      expect(screen.queryByAltText("user avatar")).not.toBeInTheDocument();
    });

    it("chat within chat provider", () => {
      renderWithStore(<Dashboard />, { user: mockUser });

      const chatElement = screen.getByTestId("chat-container");

      expect(chatElement).toBeInTheDocument();
    });

    it("data safely without user in redux state", () => {
      renderWithStore(<Dashboard />, { user: null });

      expect(screen.queryByAltText("user avatar")).not.toBeInTheDocument();

      expect(
        screen.queryByRole("heading", { level: 1 })
      ).not.toBeInTheDocument();

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("child components", () => {
      renderWithStore(<Dashboard />, { user: mockUser });

      expect(screen.getByTestId("classroom-component")).toBeInTheDocument();
      expect(screen.getByTestId("friendsearch-component")).toBeInTheDocument();
      expect(screen.getByTestId("notifications-component")).toBeInTheDocument();
      expect(screen.getByTestId("chat-container")).toBeInTheDocument();
    });
  });

  it("should successfully navigate to user profile", () => {
    renderWithStore(<Dashboard />);

    const avatarWrapper = screen
      .getByTitle("visit your profile")
      .closest(".avatar-wrapper");
    expect(avatarWrapper).toBeInTheDocument();

    fireEvent.click(avatarWrapper);

    expect(mockNavigate).toHaveBeenCalledWith(`/profile/${mockUser._id}`);
  });
});
