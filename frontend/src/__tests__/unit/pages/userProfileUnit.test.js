import { render, screen } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import socketEventManager from "../../../features/socket/managers/socket.eventManager";
import UserProfile from "../../../pages/UserProfile";
import {
  getUserList,
  getFriendList,
  resetUserList,
  handleBlock,
} from "../../../features/friend/friendSlice.js";
import {
  getExamScores,
  resetExam,
} from "../../../features/quizzes/exam/examSlice.js";

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
      describe("message `please wait`, while", () => {
        it("auth state is loading", () => {
          mockUseParams.mockReturnValue({ userId: mockSender._id });

          renderWithStore(<UserProfile />, {
            auth: { isLoading: true, user: mockSender },
          });

          expect(screen.getByText(/Loading,please wait/i)).toBeInTheDocument();
          expect(screen.queryByText(mockSender.name)).not.toBeInTheDocument();
        });
      });

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
            auth: {
              isLoading: false,
              user: { _id: "authUser_1", name: "Auth User" },
            },
            exam: { isLoading: false, examScores: {} },
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
            auth: { isLoading: false, user: mockSender },
            friend: {
              isLoading: false,
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
            exam: { isLoading: false },
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
            auth: { isLoading: false, user: mockReceiver },
            friend: {
              isLoading: false,
              userList: [{ ...mockFriendDoc }],
              friendList: [{ ...mockFriendDoc }],
            },
            exam: { isLoading: false },
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

      describe("block message, when", () => {
        it("sender visits the page", () => {
          mockUseParams.mockReturnValue({ userId: mockReceiver._id });

          renderWithStore(<UserProfile />, {
            auth: { isLoading: false, user: { ...mockSender } },
            friend: {
              isLoading: false,
              isLoading: false,
              friendList: [blockedFriend],
            },
            exam: { isLoading: false },
          });

          expect(
            screen.queryByText(/You cannot interact with this user/i)
          ).toBeInTheDocument();
        });

        it("receiver visits the page", () => {
          mockUseParams.mockReturnValue({ userId: mockSender._id });

          renderWithStore(<UserProfile />, {
            auth: { isLoading: false, user: mockReceiver },
            friend: {
              isLoading: false,
              friendList: [blockedFriend],
            },
            exam: { isLoading: false },
          });

          expect(
            screen.queryByText(/You cannot interact with this user/i)
          ).toBeInTheDocument();
        });
      });
    });

    describe("should dispatch reducers to", () => {
      it("fetch initial data, on component mount", () => {
        const paramId = mockSender._id;
        mockUseParams.mockReturnValue({ userId: paramId });

        renderWithStore(<UserProfile />, {
          auth: { isLoading: false, ...mockSender },
          friend: { isLoading: false },
          exam: { isLoading: false },
        });

        expect(getFriendList).toHaveBeenCalled();
        expect(getFriendList).toHaveBeenCalledTimes(1);

        expect(getUserList).toHaveBeenCalled();
        expect(getUserList).toHaveBeenCalledTimes(1);

        expect(getExamScores).toHaveBeenCalled();
        expect(getExamScores).toHaveBeenCalledTimes(1);
      });

      it("reset redux state, on component unmount", () => {
        const paramId = mockSender._id;
        mockUseParams.mockReturnValue({ userId: paramId });

        const { unmount } = renderWithStore(<UserProfile />, {
          auth: { isLoading: false, ...mockSender },
          friend: { isLoading: false },
          exam: { isLoading: false },
        });

        unmount();

        expect(resetUserList).toHaveBeenCalled();
        expect(resetUserList).toHaveBeenCalledTimes(1);

        expect(resetExam).toHaveBeenCalled();
        expect(resetExam).toHaveBeenCalledTimes(1);
      });
    });

    describe("socket related behavior, should ", () => {
      it("subscribe to socket events on mount", () => {
        const paramId = mockSender._id;
        mockUseParams.mockReturnValue({ userId: paramId });

        renderWithStore(<UserProfile />, {
          auth: { isLoading: false, ...mockSender },
          friend: { isLoading: false },
          exam: { isLoading: false },
        });

        for (const evt of socketEvents) {
          expect(socketEventManager.subscribe).toHaveBeenCalledWith(
            evt,
            expect.any(Function)
          );
        }
      });

      it("react to `user blocked` socket event", () => {
        mockUseParams.mockReturnValue({ userId: mockReceiver._id });

        renderWithStore(<UserProfile />, {
          auth: { isLoading: false, user: mockSender },
          friend: { isLoading: false },
          exam: { isLoading: false },
        });

        const subscribeCall = socketEventManager.subscribe.mock.calls.find(
          ([eventName]) => eventName === "user blocked"
        );

        const callback = subscribeCall[1];

        act(() => {
          callback(mockReceiver._id);
        });

        expect(mockDispatch).toHaveBeenCalledWith(handleBlock());
        expect(mockDispatch).toHaveBeenCalledWith(getUserList());
        expect(mockDispatch).toHaveBeenCalledWith(
          getFriendList(mockSender._id)
        );
      });

      it("unsubscribe to socket events on unmount", () => {
        const paramId = mockSender._id;
        mockUseParams.mockReturnValue({ userId: paramId });

        const { unmount } = renderWithStore(<UserProfile />, {
          auth: { isLoading: false, ...mockSender },
          friend: { isLoading: false },
          exam: { isLoading: false },
        });

        unmount();

        for (const evt of socketEvents) {
          expect(socketEventManager.unsubscribe).toHaveBeenCalledWith(evt);
        }
      });
    });
  });
});
