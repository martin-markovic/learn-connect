import { act } from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Quiz from "../../../pages/Quiz";
import socketEventManager from "../../../features/socket/managers/socket.eventManager.js";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: () => jest.fn(),
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

jest.mock("../../../features/socket/managers/socket.eventManager.js", () => ({
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  handleEmitEvent: jest.fn(),
}));

const mockUser = {
  _id: "userId_1",
};

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
          user: null,
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

  let result;
  act(() => {
    result = render(<Provider store={store}>{component}</Provider>);
  });

  return result;
};

describe("Quiz Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render quiz data and ", () => {
    renderWithStore(<Quiz />, {
      auth: { user: mockUser._id },
    });

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
});
