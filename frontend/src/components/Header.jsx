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

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetQuizzes());
    dispatch(resetUser());
    navigate("/login");
  };

  return (
    <header>
      <ul>
        {user ? (
          <>
            <li>
              <button onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
            {location.pathname === "/quizzes" ? (
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  <FaHome /> Home
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    navigate("/quizzes");
                  }}
                >
                  <FaClipboard /> Quizzes
                </button>
              </li>
            )}
          </>
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
