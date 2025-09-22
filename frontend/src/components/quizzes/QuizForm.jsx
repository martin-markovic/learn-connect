import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateQuiz } from "../../features/quizzes/quizSlice.js";
import { toast } from "react-toastify";
import {
  resetClassroom,
  getClassroomList,
} from "../../features/classroom/classroomSlice.js";
import socketEventManager from "../../features/socket/managers/socket.eventManager.js";

const initialQuestionState = {
  question: "",
  choices: ["", "", ""],
  answer: "",
};

const initialQuizState = {
  title: "",
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
  const { question, choices, answer } = questionState;
  const { classroomList } = useSelector((state) => state.classroom);
  const { user } = useSelector((state) => state.auth);

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

  useEffect(() => {
    dispatch(getClassroomList());

    return () => {
      dispatch(resetClassroom());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "classroom") {
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
    try {
      e.preventDefault();

      const { title, classroomId, timeLimit, questions, editQuizId } =
        quizState;

      if (!title || !classroomId) {
        toast.error("Please add all fields");
        return;
      }

      if (!timeLimit || timeLimit < 3 || timeLimit > 10) {
        toast.error(
          "Please provide a valid time limit (between 3 and 10 minutes)."
        );
        return;
      }

      const quizLen = questions.length;

      if (quizLen < 5 || quizLen > 20) {
        toast.error("Please provide between 5 and 20 questions");
        return;
      }

      for (let question of questions) {
        if (
          !question.question ||
          question.choices.some((choice) => !choice) ||
          !question.answer
        ) {
          toast.error(
            "Please ensure all questions have a question text, choices, and an answer."
          );
          return;
        }
      }

      const quizData = {
        title,
        classroomId,
        questions,
        timeLimit,
      };

      if (quizState.isEditing) {
        dispatch(updateQuiz({ id: editQuizId, quizData }));
      } else {
        socketEventManager.handleEmitEvent("submit quiz", {
          senderId: user?._id,
          receiverId: classroomId,
          quizData,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error submitting new quiz: ", error.message);
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
      toast.error(error.message);
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
    <div className="quiz__form-container">
      <form id="quiz-form" onSubmit={handleSubmit}>
        <div className="quiz__form-group">
          <span>Add quiz title:</span>
          <input
            type="text"
            id="title"
            name="title"
            value={title || ""}
            onChange={handleChange}
          />
        </div>

        <div className="quiz__form-group">
          <span>Select Classroom:</span>
          <select
            id="classroom"
            name="classroom"
            value={quizState.classroomId || ""}
            onChange={handleChange}
          >
            <option value="" disabled={true}></option>
            {classroomList.length > 0 ? (
              classroomList.map((classroom) => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name}
                </option>
              ))
            ) : (
              <option value="">No classrooms available</option>
            )}
          </select>
        </div>

        <div className="quiz__form-group">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentQuestionIndex <= 0}
          >
            Previous Question
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentQuestionIndex >= quizState.questions.length}
          >
            Next Question
          </button>
        </div>
        <div>
          <span>
            Question{" "}
            {quizState.questions.length > 0 ? currentQuestionIndex + 1 : 1}
          </span>
        </div>

        <div className="quiz__form-group">
          <span>Add question:</span>
          <input
            type="text"
            id="question"
            name="question"
            value={question || ""}
            onChange={handleChange}
          />
        </div>

        <div className="quiz__form-group">
          <span>Add choices:</span>
          <div className="quiz__choices-container">
            {choices.map((choice, index) => (
              <div className="choice-container" key={index}>
                <input
                  className="choice-radio"
                  type="radio"
                  id={`choice-radio-${index}`}
                  name="choice"
                  value={choice || ""}
                  disabled
                />
                <input
                  className="choice-input"
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
        </div>

        <div className="quiz__form-group">
          <span>Add answer:</span>
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

        <div className="quiz__form-group">
          <span>Add time limit:</span>
          <div>
            <input
              type="number"
              id="time-limit"
              name="time-limit"
              min={3}
              max={10}
              value={timeLimit}
              onChange={handleChange}
              required
              style={{ width: "2em" }}
            />
            <span>minutes</span>
          </div>
        </div>

        <div className="quiz__form-group">
          <button type="button" onClick={handleCancel}>
            Cancel Editing
          </button>
          {isEditing ? (
            <input
              style={{ fontSize: "smaller" }}
              type="submit"
              value="Update Quiz"
            />
          ) : (
            <input
              style={{ fontSize: "smaller" }}
              type="submit"
              value="Create Quiz"
            />
          )}
        </div>
      </form>
    </div>
  );
}

export default QuizForm;
