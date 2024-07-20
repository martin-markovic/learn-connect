import { FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, reset } from "../features/auth/authSlice.js";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onClick = async () => {
    await dispatch(logoutUser());
    dispatch(reset());
    navigate("/login");
  };

  return (
    <header>
      <ul>
        {user ? (
          <>
            <li>
              <button onClick={onClick}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
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