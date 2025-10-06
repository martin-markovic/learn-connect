import { act } from "react";
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
import socketEventManager from "../../../features/socket/managers/socket.eventManager.js";

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

const createMockStore = (initState = initialState) => {
  return configureStore({
    reducer: {
      auth: (state, action) => {
        state = authInitialState;

        return state;
      },
      quizzes: (state, action) => {
        state = quizInitialState;

        return state;
      },
      exam: (state, action) => {
        state = examInitialState;

        return state;
      },
    },
  });
};

const renderWithStore = (component, initialState) => {
  const store = createMockStore(initialState);

  return render(<Provider store={store}>{component}</Provider>);
};

describe("Quiz Component", () => {
  beforeAll(() => {
    for (const [evtName, cb] of Object.entries(socketEvents)) {
      socketEventManager.subscribe(evtName, cb);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    expect(socketEventManager.subscribe).toHaveBeenCalled();
    expect(socketEventManager.handleEmitEvent).not.toHaveBeenCalled();

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "exam/getExam" })
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "exam/getExamFeedback" })
    );
  });

  it("should successfully emit `create exam` socket event", () => {
    renderWithStore(<Quiz />, {
      quizzes: [mockQuiz],
    });

    const startBtn = screen.getByRole("button", { name: /start exam/i });
    fireEvent.click(startBtn);

    expect(socketEventManager.handleEmitEvent).toHaveBeenCalledWith(
      "create exam",
      {
        senderId: mockUser._id,
        quizId: mockQuiz._id,
      }
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

  it("should dispatch createExam and navigate on 'exam created' event", () => {
    renderWithStore(<Quiz />, {
      quizzes: [mockQuiz],
    });

    const subscribeCall = socketEventManager.subscribe.mock.calls.find(
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
