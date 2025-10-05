import { act } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Quiz from "../../../pages/Quiz";
import {
  createExam,
} from "../../../features/quizzes/exam/examSlice.js";
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
}));

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
};

const createMockStore = (initState = initialState) => {
  return configureStore({
    reducer: {
      auth: (state, action) => {
        state = {
          ...initState,
          user: mockUser,
        };

        return state;
      },
      quizzes: (state, action) => {
        state = { ...initState, classQuizzes: [] };

        return state;
      },
      exam: (state, action) => {
        state = { ...initState, examData: null, quizFeedback: null };

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
