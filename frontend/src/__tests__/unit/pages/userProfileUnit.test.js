import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import socketEventManager from "../../../features/socket/managers/socket.eventManager";
import UserProfile from "../../../pages/UserProfile";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const setupState = (stateProps) => {
  return { ...initialState, ...stateProps };
};

const mockSender = {
  _id: "userId_1",
  name: "Alice One",
};
const mockReceiver = {
  _id: "userId_2",
  name: "Bob Two",
};

const mockScores = {};

const mockUserList = [];
const mockFriendList = [];
const mockFriendDoc = {
  _id: "friendDoc_1",
  senderId: mockSender._id,
  receiverId: mockReceiver._id,
  sender: { ...mockSender },
  receiver: { ...mockReceiver },
  status: "accepted",
};

const blockedFriend = {
  senderId: mockReceiver._id,
  receiverId: mockSender._id,
  status: "blocked",
};

const mockExamScores = {
  _id: "examDoc_1",
  quiz: {
    quizId: "",
    quizTitle: "",
  },
  examId: "",
  userId: mockSender._id,
  latestScore: 2,
  highScore: 3,
};

const authInitialState = setupState({ user: mockSender });
const examInitialState = setupState({ examScores: mockScores });
const friendInitialState = setupState({
  userList: mockUserList,
  friendList: mockFriendList,
});

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockUseParams = jest.fn();

const socketEvents = ["user blocked"];

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../features/friend/friendSlice.js", () => ({
  getUserList: jest.fn(),
  getFriendList: jest.fn(),
  resetUserList: jest.fn(),
  handleBlock: jest.fn(),
}));

jest.mock("../../../features/quizzes/exam/examSlice.js", () => ({
  getExamScores: jest.fn(),
  resetExam: jest.fn(),
}));

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...authInitialState, ...initState.auth }) => state,
      friends: (state = { ...friendInitialState, ...initState.friend }) =>
        state,
      exam: (state = { ...examInitialState, ...initState.exam }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

const renderWithStore = (component, initialState) => {
  const store = createMockStore(initialState);

  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe("User Profile Component", () => {
  beforeAll(() => {
    for (const [evtName, cb] of socketEvents) {
      socketEventManager.subscribe(evtName, cb);
    }

    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => jest.useRealTimers());

  describe("on mount and unmount", () => {
    describe("redux-related behavior, should render", () => {
      describe("message `user not found` when", () => {
        it("param is undefined", () => {
          mockUseParams.mockReturnValue({ userId: undefined });
          renderWithStore(<UserProfile />);
          expect(
            screen.queryAllByText(/User not found/i).length
          ).toBeGreaterThan(0);
        });

        it("user profile does not exist", () => {
          mockUseParams.mockReturnValue({ userId: "randomUser_1" });
          const mockState = {
            friends: {
              isLoading: false,
              userList: [
                {
                  sender: { _id: "user_2", name: "Alice" },
                  receiver: { _id: "user_3", name: "Bob" },
                },
              ],
              friendList: [],
            },
            auth: { user: { _id: "authUser_1", name: "Auth User" } },
            exam: { examScores: {} },
          };
          renderWithStore(<UserProfile />, mockState);
          expect(screen.queryByText(/User not found/i)).toBeInTheDocument();
        });
      });

      describe("sender profile info, when", () => {
        it("sender views page", () => {
          mockUseParams.mockReturnValue({ userId: mockSender._id });
          const { store } = renderWithStore(<UserProfile />, {
            auth: { user: mockSender },
            friend: {
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
          });
          expect(screen.queryByText(/Alice One/i)).toBeInTheDocument();
          expect(
            screen.getByRole("button", { name: /Edit Account Info/i })
          ).toBeInTheDocument();
          const renderedFriendlist = store.getState().friends.friendList;
          expect(renderedFriendlist).toHaveLength(1);
          for (const [key, value] of Object.entries(renderedFriendlist[0])) {
            expect(mockFriendDoc[key]).toEqual(value);
          }
        });

        it("receiver views page", () => {
          mockUseParams.mockReturnValue({ userId: mockSender._id });
          const { store } = renderWithStore(<UserProfile />, {
            auth: { user: mockReceiver },
            friend: {
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
          });
          const renderedFriendlist = store.getState().friends.friendList;
          expect(screen.queryByText(/Alice One/i)).toBeInTheDocument();
          expect(
            screen.queryByRole("button", { name: /Edit Account Info/i })
          ).not.toBeInTheDocument();
          expect(renderedFriendlist).toHaveLength(1);
          for (const [key, value] of Object.entries(renderedFriendlist[0])) {
            expect(mockFriendDoc[key]).toEqual(value);
          }
        });
      });

      describe("receiver profile info, when", () => {
        it("sender views page", () => {
          mockUseParams.mockReturnValue({ userId: mockReceiver._id });
          const { store } = renderWithStore(<UserProfile />, {
            auth: { user: mockSender },
            friend: {
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
          });
          expect(screen.queryByText(/Bob Two/i)).toBeInTheDocument();
          expect(
            screen.queryByRole("button", { name: /Edit Account Info/i })
          ).not.toBeInTheDocument();
          const renderedFriendlist = store.getState().friends.friendList;
          expect(renderedFriendlist).toHaveLength(1);
          for (const [key, value] of Object.entries(renderedFriendlist[0])) {
            expect(mockFriendDoc[key]).toEqual(value);
          }
        });

        it("receiver views page", () => {
          mockUseParams.mockReturnValue({ userId: mockReceiver._id });
          const { store } = renderWithStore(<UserProfile />, {
            auth: { user: mockReceiver },
            friend: {
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
          });
          expect(screen.queryByText(/Bob Two/i)).toBeInTheDocument();
          expect(
            screen.getByRole("button", { name: /Edit Account Info/i })
          ).toBeInTheDocument();
          const renderedFriendlist = store.getState().friends.friendList;
          expect(renderedFriendlist).toHaveLength(1);
          for (const [key, value] of Object.entries(renderedFriendlist[0])) {
            expect(mockFriendDoc[key]).toEqual(value);
          }
        });
      });
    });
  });
});
