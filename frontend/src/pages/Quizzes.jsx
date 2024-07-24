import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import QuizForm from "../components/QuizForm";
import {
  getQuizzes,
  deleteQuiz,
  resetQuizzes,
} from "../features/quizzes/quizSlice.js";

function Quizzes() {
  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const handleEdit = (quiz) => {
    setEditQuiz(quiz);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    try {
      dispatch(deleteQuiz(id));
    } catch (error) {
      console.error("Error in handleDelete:", error);
    }
  };

  return (
    <div>
      {openForm ? (
        <QuizForm quiz={editQuiz} onClose={() => setOpenForm(false)} />
      ) : localQuizzes.length > 0 ? (
        <div>
          <button
            onClick={() => {
              setEditQuiz(null);
              setOpenForm(true);
            }}
          >
            Add New Quiz
          </button>
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
      )}
    </div>
  );
}
export default Quizzes;
