import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { resetUser } from "../../../features/auth/authSlice.js";
import { resetQuizzes } from "../../../features/quizzes/quizSlice.js";
import { resetClassroom } from "../../../features/classroom/classroomSlice.js";
import { resetChat } from "../../../features/chat/chatSlice.js";
import { resetUserList } from "../../../features/friend/friendSlice.js";
import {
  getExam,
  resetExam,
} from "../../../features/quizzes/exam/examSlice.js";
import Header from "../../../components/Header.jsx";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../../features/auth/authSlice.js", () => ({
  resetUser: jest.fn(),
}));

jest.mock("../../../features/quizzes/quizSlice.js", () => ({
  resetQuizzes: jest.fn(),
}));

jest.mock("../../../features/classroom/classroomSlice.js", () => ({
  resetClassroom: jest.fn(),
}));

jest.mock("../../../features/chat/chatSlice.js", () => ({
  resetChat: jest.fn(),
}));

jest.mock("../../../features/friend/friendSlice.js", () => ({
  resetUserList: jest.fn(),
}));

jest.mock("../../../features/quizzes/exam/examSlice.js", () => ({
  getExam: jest.fn(),
  resetExam: jest.fn(),
}));

jest.mock("../../../hooks/useGlobalEvents.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/" }),
}));

jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

const mockUser = {
  _id: "userId_1",
  email: "aliceone@gmail.com",
  name: "Alice One",
};

const unregisteredUser = {
  _id: null,
  email: null,
  name: "John Doe",
};

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
};

const authInitialState = { ...initialState, user: mockUser };
const examInitialState = { ...initialState };

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...authInitialState, ...initState.auth }) => state,
      exam: (state = { ...examInitialState, ...initState.exam }) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

const renderWithStore = (component, initState = {}) => {
  const store = createMockStore(initState);

  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe("Header component", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => jest.useRealTimers());

  describe("lifecycle behavior", () => {
    describe("on mount should", () => {
      it("render initial data with authenticated user", () => {
        renderWithStore(<Header />);

        expect(screen.queryByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Quizzes/i)).toBeInTheDocument();
        expect(screen.getByText(/Exam/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();

        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
      });

      it("render links to auth pages without authenticated user", () => {
        renderWithStore(<Header />, {
          auth: { user: null },
        });

        expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Quizzes/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Exam/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();

        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Register/i)).toBeInTheDocument();
      });

      it("render links to auth pages with for users without _id field", () => {
        renderWithStore(<Header />, {
          auth: { user: unregisteredUser },
        });

        expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Quizzes/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Exam/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();

        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Register/i)).toBeInTheDocument();
      });
    });
  });

  describe("interactive behavior", () => {
    it("should navigate to auth pages on link clicks", () => {});

    it("should dispatch reducers for resetting redux state on logout, and navigate to login page", () => {
      renderWithStore(<Header />);

      fireEvent.click(screen.getByText(/Logout/i));

      expect(mockDispatch).toHaveBeenCalledWith(resetQuizzes());
      expect(mockDispatch).toHaveBeenCalledWith(resetUser());
      expect(mockDispatch).toHaveBeenCalledWith(resetChat());
      expect(mockDispatch).toHaveBeenCalledWith(resetClassroom());
      expect(mockDispatch).toHaveBeenCalledWith(resetUserList());
      expect(mockDispatch).toHaveBeenCalledWith(resetExam());
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
