import { render, fireEvent, screen } from "@testing-library/react";
import Quizzes from "../../../pages/Quizzes.jsx";

jest.mock("../../../components/quizzes/ClassQuizList", () => () => (
  <div data-testid="class-quiz-list" />
));
jest.mock("../../../components/quizzes/UserQuizList", () => () => (
  <div data-testid="user-quiz-list" />
));

describe("Quizzes component ", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("lifecycle behavior ", () => {
    it("should properly render initial elements on mount", () => {
      render(<Quizzes />);

      const classQuizzesBtn = screen.getByRole("button", {
        name: /Class quizzes/i,
      });

      const userQuizzesBtn = screen.getByRole("button", {
        name: /User quizzes/i,
      });

      expect(classQuizzesBtn).toBeInTheDocument();
      expect(userQuizzesBtn).toBeInTheDocument();

      expect(classQuizzesBtn).toBeEnabled();
      expect(userQuizzesBtn).toBeEnabled();

      expect(screen.queryByTestId("class-quiz-list")).not.toBeInTheDocument();
      expect(screen.queryByTestId("user-quiz-list")).not.toBeInTheDocument();

      expect(
        document.querySelector(".quiz__list-container")
      ).toBeInTheDocument();
      expect(
        document.querySelector(".quiz__list-controller")
      ).toBeInTheDocument();
      expect(document.querySelector(".quiz__list-display")).toBeInTheDocument();
    });

    it("should not throw errors on unmount ", () => {
      const { unmount } = render(<Quizzes />);

      expect(() => unmount()).not.toThrow();
    });
  });

  it("in its interactive state should render correct quiz list", () => {
    render(<Quizzes />);

    const classBtn = screen.getByRole("button", { name: /Class quizzes/i });
    const userBtn = screen.getByRole("button", { name: /User quizzes/i });

    fireEvent.click(classBtn);

    expect(screen.getByTestId("class-quiz-list")).toBeInTheDocument();
    expect(screen.queryByTestId("user-quiz-list")).not.toBeInTheDocument();
    expect(classBtn).toBeDisabled();
    expect(userBtn).toBeEnabled();

    fireEvent.click(userBtn);

    expect(screen.getByTestId("user-quiz-list")).toBeInTheDocument();
    expect(screen.queryByTestId("class-quiz-list")).not.toBeInTheDocument();
    expect(userBtn).toBeDisabled();
    expect(classBtn).toBeEnabled();
  });
});
