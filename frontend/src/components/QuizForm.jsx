import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createQuiz, updateQuiz } from "../features/quizzes/quizSlice.js";

const initialState = {
  question: "",
  choices: ["", "", ""],
  answer: "",
  isEditing: false,
  editQuizId: null,
};

function QuizForm({ quiz, onClose }) {
  const [quizFormData, setQuizFormData] = useState(initialState);

  const dispatch = useDispatch();

  useEffect(() => {
    if (quiz) {
      setQuizFormData({
        question: quiz.question,
        choices: quiz.choices,
        answer: quiz.answer,
        isEditing: true,
        editQuizId: quiz._id,
      });
    } else {
      setQuizFormData(initialState);
    }
  }, [quiz]);

  const { question, choices, answer, isEditing } = quizFormData;

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        dispatch(
          updateQuiz({ id: quizFormData.editQuizId, quizData: quizFormData })
        );
      } else {
        dispatch(createQuiz(quizFormData));
      }
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleCancel = () => {
    onClose();
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
