import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Quiz from "../../../pages/Quiz";
import {
  createExam,
  getExam,
  getExamFeedback,
  resetExam,
} from "../../../features/quizzes/exam/examSlice.js";
import {
  getClassQuizzes,
  resetQuizzes,
} from "../../../features/quizzes/quizSlice.js";
import {
  mockEmitEvent,
  mockSubscribe,
  mockUnSubscribe,
  resetCallbacks,
} from "../../__mocks__/config/mockSocketManager.js";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const { toast: mockToast } = require("react-toastify");

const mockUser = {
  _id: "userId_1",
};

const quizFeedback = { _id: "quizFeedbackId_1", highScore: 2 };

const mockQuiz = {
  _id: "quizId_1",
  title: "Mock Quiz 1",
  questions: [{}, {}, {}, {}, {}],
  timeLimit: 4,
};

const mockExam = {
  _id: "examId_1",
};

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

const mockExamCreated = jest.fn();

const socketEvents = { "exam created": mockExamCreated };

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
};

const setupState = (stateProps) => {
  return { ...initialState, ...stateProps };
};

const authInitialState = setupState({ user: mockUser });
const quizInitialState = setupState({ classQuizzes: [] });
const examInitialState = setupState({ examData: null, quizFeedback: null });

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    quizId: mockQuiz._id,
  }),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

jest.mock("../../../features/quizzes/exam/examSlice.js", () => ({
  createExam: jest.fn((examData) => ({
    type: "exam/createExam",
    payload: examData,
  })),

  getExam: jest.fn(() => ({
    type: "exam/getExam",
    payload: {},
  })),

  getExamFeedback: jest.fn(() => ({
    type: "exam/getExamFeedback",
    payload: {},
  })),

  resetExam: jest.fn(() => ({
    type: "exam/resetExam",
    payload: {
      isLoading: false,
      isSuccess: false,
      isError: false,
      examData: null,
      quizFeedback: null,
    },
  })),
}));

jest.mock("../../../features/quizzes/quizSlice.js", () => ({
  getClassQuizzes: jest.fn(() => ({
    type: "quizzes/getClassQuizzes",
    payload: {
      isLoading: false,
      isSuccess: true,
      classQuizzes: [mockQuiz],
    },
  })),

  resetQuizzes: jest.fn(() => ({
    type: "quizzes/resetQuizzes",
    payload: {
      isLoading: false,
      isSuccess: false,
      isError: false,
      classQuizzes: [],
    },
  })),
}));

const createMockStore = (initState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { ...authInitialState, ...initState.auth }) => state,
      quizzes: (state = { ...quizInitialState, ...initState.quizzes }) => state,
      exam: (state = { ...examInitialState, ...initState.exam }) => state,
    },
  });
};

const renderWithStore = (component, initialState) => {
  const store = createMockStore(initialState);

  return render(<Provider store={store}>{component}</Provider>);
};

describe("Quiz Component", () => {
  beforeAll(() => {
    jest.clearAllMocks();
    resetCallbacks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetCallbacks();
  });

  afterAll(() => {
    jest.clearAllMocks();
    resetCallbacks();
  });

  describe("mount and unmount behavior", () => {
    it("should render initial loading state with the available quiz info", () => {
      renderWithStore(<Quiz />);

      expect(
        screen.getByText(/loading quizzes, please wait/i)
      ).toBeInTheDocument();

      expect(
        screen.getByText(/you have not taken this quiz yet/i)
      ).toBeInTheDocument();

      const startBtn = screen.getByRole("button", { name: /start exam/i });
      expect(startBtn).toBeInTheDocument();
      expect(startBtn).toBeEnabled();

      expect(mockSubscribe).toHaveBeenCalled();
      expect(mockEmitEvent).not.toHaveBeenCalled();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "exam/getExam" })
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "exam/getExamFeedback" })
      );
    });

    it("should cleanup state on component unmount", () => {
      const { unmount } = renderWithStore(<Quiz />);
      unmount();

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "quizzes/resetQuizzes",
          payload: { ...quizInitialState },
        })
      );

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "exam/resetExam",
          payload: { ...examInitialState },
        })
      );
    });

    it("should unsubscribe to socket events", () => {
      const { unmount } = renderWithStore(<Quiz />);
      unmount();

      expect(mockUnSubscribe).toHaveBeenCalled();

      expect(mockUnSubscribe).toHaveBeenCalledWith("exam created");
    });

    it("should display quiz feedback if available", () => {
      const examState = { ...examInitialState, quizFeedback };
      renderWithStore(<Quiz />, {
        quizzes: { ...quizInitialState, classQuizzes: [mockQuiz] },
        exam: examState,
      });

      expect(screen.getByText(/Your highest score: 2/i)).toBeInTheDocument();

      const resultBtn = screen.getByRole("button", { name: /here/i });
      fireEvent.click(resultBtn);
    });

    it("should display in-progress exam message and navigation button if isInProgress is true", () => {
      const examDataInProgress = { ...mockExam, isInProgress: true };

      const examState = { ...examInitialState, examData: examDataInProgress };

      renderWithStore(<Quiz />, { exam: examState });

      expect(
        screen.getByText(/exam is currently in progress/i)
      ).toBeInTheDocument();

      const navigateBtn = screen.getByRole("button", { name: /here/i });

      expect(navigateBtn).toBeInTheDocument();
      expect(navigateBtn).toBeEnabled();

      fireEvent.click(navigateBtn);
      expect(mockNavigate).toHaveBeenCalledWith(
        `/exam/${examDataInProgress._id}`
      );
    });
  });

  describe("socket reactivity behavior", () => {
    it("should successfully emit `create exam` socket event", () => {
      renderWithStore(<Quiz />, {
        quizzes: [mockQuiz],
      });

      const startBtn = screen.getByRole("button", { name: /start exam/i });
      fireEvent.click(startBtn);

      expect(mockEmitEvent).toHaveBeenCalledWith("create exam", {
        senderId: mockUser._id,
        quizId: mockQuiz._id,
      });
    });

    it("should dispatch createExam and navigate on 'exam created' event", () => {
      renderWithStore(<Quiz />, {
        quizzes: [mockQuiz],
      });

      const subscribeCall = mockSubscribe.mock.calls.find(
        ([eventName]) => eventName === "exam created"
      );

      const callback = subscribeCall[1];

      const mockData = { _id: mockExam._id, quizId: mockQuiz._id };

      callback(mockData);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "exam/createExam",
          payload: mockData,
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith(`/exam/${mockData._id}`);
    });
  });

  describe("should toast error messages on redux", () => {
    it("auth error", () => {
      const errorMessage = "Auth error";
      renderWithStore(<Quiz />, {
        auth: {
          isError: true,
          errorMessage,
        },
      });

      expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
    });

    it("exam error", () => {
      const errorMessage = "Exam error";
      renderWithStore(<Quiz />, {
        exam: {
          isError: true,
          errorMessage,
        },
      });

      expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
    });

    it("quiz error", () => {
      const errorMessage = "Quizz error";
      renderWithStore(<Quiz />, {
        quizzes: {
          isError: true,
          errorMessage,
        },
      });

      expect(mockToast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
