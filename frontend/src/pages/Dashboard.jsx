import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../features/auth/authSlice.js";
import Profile from "../components/Profile";
import Newsfeed from "../components/Newsfeed.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  return (
    <main className="flex__container-dashboard">
      <div className="flex__container-item">
        <Newsfeed />
      </div>
      <div className="flex__container-item">
        <Profile />
      </div>
    </main>
  );
}
