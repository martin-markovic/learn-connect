import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import useSocket from "./hooks/useSocket.js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import socketEventManager from "./features/socket/socket.eventManager.js";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Header from "./components/Header.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import { setUser } from "./features/auth/authSlice.js";
import Quiz from "./pages/Quiz.jsx";
import Exam from "./components/quizzes/Exam.jsx";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = user?.token;
  const socketInstance = useSocket(token);

  useEffect(() => {
    if (socketInstance) {
      socketEventManager.setSocketInstance(socketInstance);
    }
  }, [socketInstance]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
        dispatch(setUser(parsedUser));
      }
    }

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          dispatch(setUser(null));
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        dispatch(setUser(null));
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, user, token]);

  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:userId"
            element={token ? <UserProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/quizzes"
            element={token ? <Quizzes /> : <Navigate to="/login" />}
          />
          <Route
            path="/quizzes/:quizId"
            element={token ? <Quiz /> : <Navigate to="/login" />}
          />
          <Route
            path="/exam/:examId"
            element={token ? <Exam /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
