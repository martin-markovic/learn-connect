import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addNewQuiz,
  getUserQuizzes,
  deleteQuiz,
  resetQuizzes,
} from "../../features/quizzes/quizSlice.js";
import QuizForm from "./QuizForm.jsx";
import socketEventManager from "../../features/socket/socket.eventManager.js";

function UserQuizList() {
  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userQuizzes = [], isLoading } = useSelector((state) => state.quizzes);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserQuizzes());

    return () => {
      dispatch(resetQuizzes());
    };
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(userQuizzes)) {
      setLocalQuizzes(userQuizzes);
    } else {
      setLocalQuizzes([]);
    }
  }, [userQuizzes]);

  useEffect(() => {
    socketEventManager.subscribe("new quiz created", (data) => {
      if (data.createdBy === user?._id) {
        dispatch(addNewQuiz(data));
      }
    });

    return () => {
      socketEventManager.unsubscribe("new quiz created");
    };
  }, [user, dispatch]);

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

  return isLoading ? (
    <p>Loading...</p>
  ) : openForm ? (
    <QuizForm quiz={editQuiz} onClose={() => setOpenForm(false)} />
  ) : (
    <div>
      <button
        onClick={() => {
          setEditQuiz(null);
          setOpenForm(true);
        }}
      >
        Add New Quiz
      </button>
      {localQuizzes.length > 0 ? (
        <div>
          {localQuizzes.map((quiz, index) => (
            <div key={index}>
              <p>{quiz.title}</p>
              <button
                onClick={() => {
                  navigate(`/quizzes/${quiz._id}`);
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
        <p>No quizzes created.</p>
      )}
    </div>
  );
}

export default UserQuizList;
