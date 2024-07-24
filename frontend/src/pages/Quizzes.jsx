import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  createQuiz,
  getQuizzes,
  updateQuiz,
  deleteQuiz,
  resetQuizzes,
} from "../features/quizzes/quizSlice.js";

const initialState = {
  question: "",
  choices: ["", "", ""],
  answer: "",
  isEditing: false,
  editQuizId: null,
};

function Quizzes() {
  const [quizFormData, setQuizFormData] = useState(initialState);
  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [quizQuery, setQuizQuery] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { question, choices, answer, isEditing } = quizFormData;
  const {
    quizzes: reduxQuizzes = [],
    isError,
    isSuccess,
  } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(getQuizzes());

    return () => {
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(reduxQuizzes)) {
      setLocalQuizzes(reduxQuizzes);
    } else {
      setLocalQuizzes([]);
    }
  }, [reduxQuizzes]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setQuizFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;

    setQuizFormData((prevState) => ({
      ...prevState,
      choices: newChoices,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      dispatch(createQuiz(quizFormData));
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }

    setQuizFormData(initialState);
  };

  const handleDelete = (id) => {
    try {
      dispatch(deleteQuiz(id));
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  const handleEdit = (quizToEdit) => {
    setQuizQuery(quizFormData);

    setQuizFormData({
      question: quizToEdit.question,
      choices: quizToEdit.choices,
      answer: quizToEdit.answer,
      isEditing: true,
      editQuizId: quizToEdit._id,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    try {
      const quizData = {
        question: quizFormData.question,
        choices: quizFormData.choices,
        answer: quizFormData.answer,
      };

      if (!quizFormData.editQuizId) {
        throw new Error("Quiz ID is missing");
      }

      dispatch(updateQuiz({ id: quizFormData.editQuizId, quizData }));
    } catch (error) {
      return console.error("Error in handleUpdate:", error);
    }

    setQuizFormData(initialState);
  };

  const cancelUpdate = () => {
    setQuizFormData(quizQuery || initialState);
    setQuizQuery(null);
  };

  return (
    <div>
      <form id="quiz-form" onSubmit={isEditing ? handleUpdate : handleSubmit}>
        <div>
          <label htmlFor="question">Add question</label>
          <input
            type="text"
            id="question"
            name="question"
            value={question}
            onChange={handleChange}
          />
        </div>

        <div>
          <span>Add choices</span>
          {choices.map((choice, index) => (
            <div key={index}>
              <input
                type="radio"
                id={`choice-radio-${index}`}
                name="choice"
                value={choice}
                disabled
              />
              <label htmlFor={`choice-radio-${index}`}>{choice}</label>
              <input
                type="text"
                id={`choice-text-${index}`}
                name={`choice-${index}`}
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="answer">Add answer</label>
          <input
            type="text"
            id="answer"
            name="answer"
            value={answer}
            onChange={handleChange}
          />
        </div>
        {isEditing ? (
          <>
            <button type="button" onClick={cancelUpdate}>
              Cancel
            </button>
            <input type="submit" value="Update Quiz" />
          </>
        ) : (
          <input type="submit" value="Create Quiz" />
        )}
      </form>
      {!isEditing ? (
        localQuizzes.length > 0 ? (
          <div>
            {localQuizzes.map((quiz, index) => (
              <div key={index}>
                <p>{quiz.question}</p>
                <button
                  onClick={() => {
                    navigate(`/${quiz._id}`);
                  }}
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    handleEdit(quiz);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(quiz._id)}>Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No quizzes available.</p>
        )
      ) : null}
    </div>
  );
}

export default Quizzes;
