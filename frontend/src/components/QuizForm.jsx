import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createQuiz, updateQuiz } from "../features/quizzes/quizSlice.js";

const initialQuestionState = {
  question: "",
  choices: ["", "", ""],
  answer: "",
};

const initialQuizState = {
  title: "",
  subject: "",
  classroomId: "",
  questions: [],
  timeLimit: 3,
  isEditing: false,
  editQuizId: null,
};

function QuizForm({ quiz, onClose }) {
  const [quizState, setQuizState] = useState(initialQuizState);
  const [questionState, setQuestionState] = useState(initialQuestionState);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const dispatch = useDispatch();

  const { title, timeLimit, isEditing } = quizState;
  const { question, choices, answer, classroomId } = questionState;
  const { classrooms = [] } = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (quiz) {
      setQuizState({
        title: quiz.title || "",
        questions: quiz.questions || [],
        timeLimit: quiz.timeLimit || 3,
        isEditing: true,
        editQuizId: quiz._id || null,
      });
      if (quiz.questions.length > 0) {
        setQuestionState(quiz.questions[0] || initialQuestionState);
        setCurrentQuestionIndex(quiz.questions.length - 1);
      } else {
        setQuestionState(initialQuestionState);
        setCurrentQuestionIndex(0);
      }
    } else {
      setQuizState(initialQuizState);
      setQuestionState(initialQuestionState);
      setCurrentQuestionIndex(0);
    }
  }, [quiz]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "subject") {
      setQuizState((prevState) => ({
        ...prevState,
        subject: value || "",
      }));
    } else if (name === "classroom") {
      setQuizState((prevState) => ({
        ...prevState,
        classroomId: value || "",
      }));
    } else if (name.startsWith("choice-")) {
      const index = parseInt(name.split("-")[1], 10);
      handleChoiceChange(index, value || "");
    } else if (name === "answer") {
      setQuestionState((prevState) => ({
        ...prevState,
        answer: value || "",
      }));
    } else if (name === "question") {
      setQuestionState((prevState) => ({
        ...prevState,
        question: value || "",
      }));
    } else if (name === "time-limit") {
      setQuizState((prevState) => ({
        ...prevState,
        timeLimit: parseInt(value, 10) || 3,
      }));
    } else {
      setQuizState((prevState) => ({
        ...prevState,
        [name]: value || "",
      }));
    }
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...questionState.choices];
    newChoices[index] = value || "";

    setQuestionState((prevState) => ({
      ...prevState,
      choices: newChoices,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, subject, classroom, timeLimit, questions, editQuizId } =
      quizState;

    if (!title || !subject || !classroom) {
      console.error("Please add all fields");
      return;
    }

    if (!timeLimit || timeLimit < 3 || timeLimit > 10) {
      console.error(
        "Please provide a valid time limit (between 3 and 10 minutes)."
      );
      return;
    }

    const quizLen = questions.length;

    if (quizLen < 5 || quizLen > 20) {
      console.error("Please provide between 5 and 20 questions");
      return;
    }

    for (let question of questions) {
      if (
        !question.question ||
        question.choices.some((choice) => !choice) ||
        !question.answer
      ) {
        console.error(
          "Please ensure all questions have a question text, choices, and an answer."
        );
        return;
      }
    }

    try {
      const quizData = {
        title,
        subject,
        classroomId,
        questions,
        timeLimit,
      };

      if (quizState.isEditing) {
        dispatch(updateQuiz({ id: editQuizId, quizData }));
      } else {
        dispatch(createQuiz(quizData));
      }
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleCreateQuestion = () => {
    const radioValidation = choices.some((ch) => {
      return ch === "";
    });

    try {
      if (question === "" || answer === "" || radioValidation) {
        throw new Error("Please add all fields");
      }

      const newQuestion = {
        question,
        choices,
        answer,
      };

      setQuizState((prevState) => {
        const updatedQuestions = [...prevState.questions];
        if (currentQuestionIndex >= updatedQuestions.length) {
          updatedQuestions.push(newQuestion);
        } else {
          updatedQuestions[currentQuestionIndex] = newQuestion;
        }
        return {
          ...prevState,
          questions: updatedQuestions,
        };
      });

      const nextIndex = currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      setQuestionState(initialQuestionState);
    } catch (error) {
      console.error("handleCreateQuestion error:", error);
    }
  };

  const handleBack = () => {
    const prevIndex = Math.max(currentQuestionIndex - 1, 0);
    setCurrentQuestionIndex(prevIndex);
    setQuestionState(quizState.questions[prevIndex] || initialQuestionState);
  };

  const handleNext = () => {
    const nextIndex = Math.max(currentQuestionIndex + 1, 0);
    setCurrentQuestionIndex(nextIndex);
    setQuestionState(quizState.questions[nextIndex] || initialQuestionState);
  };

  return (
    <div>
      <form id="quiz-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Add quiz title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="subject">Add subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={quizState.subject || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="classroom">Select Classroom:</label>
          <select
            id="classroom"
            name="classroom"
            value={quizState.classroomId || ""}
            onChange={handleChange}
          >
            <option value="">Select a classroom</option>
            {classrooms.length > 0 ? (
              classrooms.map((classroom) => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name}
                </option>
              ))
            ) : (
              <option value="">No classrooms available</option>
            )}
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestionIndex <= 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentQuestionIndex >= quizState.questions.length}
          >
            Next
          </button>
        </div>
        <div>
          <span>
            Question{" "}
            {quizState.questions.length > 0 ? currentQuestionIndex + 1 : 1}
          </span>
        </div>

        <div>
          <label htmlFor="question">Add question:</label>
          <input
            type="text"
            id="question"
            name="question"
            value={question || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <span>Add choices:</span>
          {choices.map((choice, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`choice-radio-${index}`}
                name="choice"
                value={choice || ""}
                disabled
              />
              <label htmlFor={`choice-radio-${index}`}>{choice}</label>
              <input
                type="text"
                id={`choice-text-${index}`}
                name={`choice-${index}`}
                value={choice || ""}
                onChange={(e) =>
                  handleChoiceChange(index, e.target.value || "")
                }
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="answer">Add answer:</label>
          <input
            type="text"
            id="answer"
            name="answer"
            value={answer || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <button type="button" onClick={handleCreateQuestion}>
            Create Question
          </button>
        </div>

        <div>
          <label htmlFor="time-limit">Add time limit:</label>
          <input
            type="number"
            id="time-limit"
            name="time-limit"
            min={3}
            max={10}
            value={timeLimit}
            onChange={handleChange}
            required
          />
          <span>minutes</span>
        </div>

        <>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          {isEditing ? (
            <input type="submit" value="Update Quiz" />
          ) : (
            <input type="submit" value="Create Quiz" />
          )}
        </>
      </form>
    </div>
  );
}

export default QuizForm;
