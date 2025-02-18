import {
  FaSignInAlt,
  FaSignOutAlt,
  FaUser,
  FaClipboard,
  FaHome,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, resetUser } from "../features/auth/authSlice.js";
import { resetQuizzes } from "../features/quizzes/quizSlice.js";
import { resetClassroom } from "../features/classroom/classroomSlice.js";
import { resetChat } from "../features/chat/chatSlice.js";
import { resetUserList } from "../features/friend/friendSlice.js";
import { resetExam } from "../features/quizzes/exam/examSlice.js";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

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

  return (
    <header>
      <ul>
        {user ? (
          <div className="nav-buttons">
            <li>
              <button onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate("/");
                }}
              >
                <FaHome /> Home
              </button>
              <button
                onClick={() => {
                  navigate("/quizzes");
                }}
              >
                <FaClipboard /> Quizzes
              </button>
            </li>
          </div>
        ) : (
          <>
            {location.pathname === "/register" ? (
              <li>
                <Link to="/login">
                  <FaSignInAlt /> Login
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/register">
                  <FaUser /> Register
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
