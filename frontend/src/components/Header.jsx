import {
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaClipboard,
  FaHome,
  FaHourglassHalf,
  FaExclamationCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, resetUser } from "../features/auth/authSlice.js";
import { resetQuizzes } from "../features/quizzes/quizSlice.js";
import { resetClassroom } from "../features/classroom/classroomSlice.js";
import { resetChat } from "../features/chat/chatSlice.js";
import { resetUserList } from "../features/friend/friendSlice.js";
import {
  finishExam,
  getExam,
  resetExam,
} from "../features/quizzes/exam/examSlice.js";
import { useEffect } from "react";
import socketEventManager from "../features/socket/socket.eventManager.js";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const examId = useSelector((state) => state.exam.examData?._id);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetQuizzes());
    dispatch(resetUser());
    dispatch(resetChat());
    dispatch(resetClassroom());
    dispatch(resetUserList());
    dispatch(resetExam());
    navigate("/login");
  };

  useEffect(() => {
    if (!["/register", "/login"].includes(location.pathname)) {
      dispatch(getExam());
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    if (!["/register", "/login"].includes(location.pathname)) {
      socketEventManager.subscribe("exam finished", (data) => {
        dispatch(finishExam(data));

        if (location.pathname === `/exam/${data?.scorePayload?.quizId}`) {
          navigate("/");
        }
      });

      return () => {
        socketEventManager.unsubscribe("exam finished");
      };
    }
  }, [location.pathname]);

  return (
    <header>
      <ul>
        {user ? (
          <div className="nav-buttons">
            <li>
              <button onClick={handleLogout}>
                Logout <FaSignOutAlt />
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/");
                }}
              >
                Home <FaHome />
              </button>
              <button
                onClick={() => {
                  navigate("/quizzes");
                }}
              >
                Quizzes <FaClipboard />
              </button>
              <button
                onClick={() => {
                  if (examId) {
                    try {
                      navigate(`/exam/${examId}`);
                    } catch (error) {
                      console.log("Error navigating to exam", error.message);
                      dispatch(getExam());
                    }
                  }
                }}
                style={{ position: "relative" }}
              >
                Exam <FaHourglassHalf />
                {examId && location.pathname !== `/exam/${examId}` && (
                  <span
                    style={{
                      position: "absolute",
                      top: -7,
                      right: -7,
                      color: "red",
                      fontSize: "1.4em",
                    }}
                  >
                    <FaExclamationCircle />
                  </span>
                )}
              </button>
            </li>
          </div>
        ) : (
          <>
            {location.pathname === "/register" ? (
              <li>
                <Link to="/login">
                  Login <FaSignInAlt />
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/register">
                  Register <FaUser />
                </Link>
              </li>
            )}
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;
