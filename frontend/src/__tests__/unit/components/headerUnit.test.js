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

const mockUseGlobalEvents = jest.fn();

jest.mock("../../../hooks/useGlobalEvents.js", () => ({
  __esModule: true,
  default: () => mockUseGlobalEvents(),
}));

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

const mockUseLocation = jest.fn(() => ({ pathname: "/" }));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
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

const mockExam = {
  examData: {
    _id: "examId_1",
  },
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

  describe("mount behavior", () => {
    describe("with authenticated user", () => {
      it("renders navigation links", () => {
        renderWithStore(<Header />);

        expect(screen.queryByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Quizzes/i)).toBeInTheDocument();
        expect(screen.getByText(/Exam/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();

        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Register/i)).not.toBeInTheDocument();
      });

      it("dispatches getExam on mount", () => {
        renderWithStore(<Header />);

        expect(mockDispatch).toHaveBeenCalledWith(getExam());
      });

      it("calls `useGlobalEvents` hook", () => {
        renderWithStore(<Header />);

        expect(mockUseGlobalEvents).toHaveBeenCalled();
      });
    });

    describe("without authenticated user", () => {
      it("does not dispatch getExam action", () => {
        renderWithStore(<Header />, {
          auth: { user: null },
        });

        expect(mockDispatch).not.toHaveBeenCalledWith();
      });

      it("renders links to auth pages, but not navigation", () => {
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

      it("does not call `useGlobalEvents` hook", () => {
        renderWithStore(<Header />, {
          auth: { user: null },
        });

        expect(mockUseGlobalEvents).not.toHaveBeenCalled();
      });
    });

    describe("with invalid user (_id missing)", () => {
      it("renders links to auth pages, but not navigation", () => {
        renderWithStore(<Header />, {
          auth: { user: unregisteredUser },
        });

        expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Quizzes/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Exam/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();

        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Register/i)).toBeInTheDocument();

        expect(mockDispatch).not.toHaveBeenCalled();
      });

      it("does not call `useGlobalEvents` hook", () => {
        renderWithStore(<Header />, {
          auth: { user: unregisteredUser },
        });

        expect(mockUseGlobalEvents).not.toHaveBeenCalled();
      });
    });
  });

  describe("navigation behavior", () => {
    it("navigates to the exam page, with ongoing exam", () => {
      renderWithStore(<Header />, {
        exam: mockExam,
      });

      fireEvent.click(screen.getByText(/Exam/i));

      expect(mockNavigate).toHaveBeenCalledWith(
        `/exam/${mockExam.examData._id}`
      );
    });

    it("does not navigate to the exam page, with no ongoing exam", () => {
      renderWithStore(<Header />, {
        exam: null,
      });

      fireEvent.click(screen.getByText(/Exam/i));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("logout behavior", () => {
    it("dispatches all reset actions", () => {
      renderWithStore(<Header />);

      fireEvent.click(screen.getByText(/Logout/i));

      expect(mockDispatch).toHaveBeenCalledWith(resetQuizzes());
      expect(mockDispatch).toHaveBeenCalledWith(resetUser());
      expect(mockDispatch).toHaveBeenCalledWith(resetChat());
      expect(mockDispatch).toHaveBeenCalledWith(resetClassroom());
      expect(mockDispatch).toHaveBeenCalledWith(resetUserList());
      expect(mockDispatch).toHaveBeenCalledWith(resetExam());
    });

    it("navigates to login page", () => {
      renderWithStore(<Header />);

      fireEvent.click(screen.getByText(/Logout/i));

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  describe("redux and side effects", () => {
    it("does not dispatch getExam if already fetched", () => {
      renderWithStore(<Header />, { isLoading: false, exam: mockExam });

      expect(mockDispatch).not.toHaveBeenCalledWith(getExam());
    });

    it("does not dispatch getExam on auth pages", () => {
      mockUseLocation.mockReturnValue({ pathname: "/login" });

      renderWithStore(<Header />);

      expect(mockDispatch).not.toHaveBeenCalledWith(getExam());

      jest.clearAllMocks();

      mockUseLocation.mockReturnValue({ pathname: "/register" });

      renderWithStore(<Header />);
      expect(mockDispatch).not.toHaveBeenCalledWith(getExam());
    });
  });
});
