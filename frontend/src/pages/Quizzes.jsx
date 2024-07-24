import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createQuiz,
  getQuizzes,
  resetQuizzes,
} from "../features/quizzes/quizSlice.js";

function Quizzes() {
  const [quizData, setQuizData] = useState({
    question: "",
    choices: ["", "", ""],
    answer: "",
  });

  const dispatch = useDispatch();

  const { question, choices, answer } = quizData;
  const { quizzes, isError, isSuccess } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(getQuizzes());

    return () => {
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setQuizData((prevState) => ({
      ...prevState,
      choices: newChoices,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(createQuiz(quizData));
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <div>
      <form id="quiz-form" onSubmit={handleSubmit}>
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

        <input type="submit" value="Create Quiz" />
      </form>
      <div>
        {quizzes.map((quiz, index) => (
          <div key={index}>
            <p>{quiz.question}</p>
            <button>Open</button>
            <button>Edit</button>
            <button>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Quizzes;
