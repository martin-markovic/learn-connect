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
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";

function UserQuizList() {
  const [localQuizzes, setLocalQuizzes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [curPage, setCurPage] = useState(1);
  const [inputVal, setInputVal] = useState("");

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
  }, [user?._id, dispatch]);

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

  const handleChange = (e) => {
    setInputVal(e.target.value);
  };

  return isLoading ? (
    <p>Loading...</p>
  ) : openForm ? (
    <QuizForm quiz={editQuiz} onClose={() => setOpenForm(false)} />
  ) : (
    <div className="user__quizzes-container">
      <div className="user__quizzes-top__box">
        <input
          type="search"
          placeholder="Search quizzes"
          value={inputVal}
          onChange={handleChange}
        ></input>
        <button
          style={{ height: "2.3em", width: "12%" }}
          onClick={() => {
            setEditQuiz(null);
            setOpenForm(true);
          }}
        >
          Create New Quiz
        </button>
      </div>
      {localQuizzes.length > 0 ? (
        <div className="quiz__entry__list-container">
          <div className="user__quiz__list-container">
            {localQuizzes
              .filter((quiz) => {
                return quiz.title
                  ?.toLowerCase()
                  .includes(inputVal.toLowerCase());
              })
              .slice((curPage - 1) * 9, curPage * 9)
              .map((quiz, index) => {
                return (
                  <div key={index} className="user__quiz__list-entry">
                    <p
                      title={`Open ${quiz?.title}`}
                      onClick={() => {
                        navigate(`/quizzes/${quiz._id}`);
                      }}
                      className="clickable"
                    >
                      {quiz.title}
                    </p>
                    <div className="entry__buttons-container">
                      <button
                        className="entry-delete"
                        onClick={() => handleDelete(quiz._id)}
                        title="Delete Quiz"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleEdit(quiz);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="user__quiz__pagination-container">
            <div>
              {curPage > 1 && (
                <FaArrowAltCircleLeft
                  className="clickable pagination-button"
                  title="Previous Page"
                  onClick={() => {
                    setCurPage((prevState) => (prevState -= 1));
                  }}
                />
              )}
            </div>
            <div>
              {localQuizzes.filter((quiz) => {
                return quiz.title
                  ?.toLowerCase()
                  .includes(inputVal.toLowerCase());
              }).length -
                curPage * 9 >
                0 && (
                <FaArrowAltCircleRight
                  className="clickable pagination-button"
                  title="Next Page"
                  onClick={() => {
                    setCurPage((prevState) => (prevState += 1));
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>No quizzes created.</p>
      )}
    </div>
  );
}

export default UserQuizList;
