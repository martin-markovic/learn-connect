import { useSelector } from "react-redux";

import Profile from "../components/Profile";
import Newsfeed from "../components/Newsfeed.jsx";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("User in redux store:", user);

    return () => {};
  }, [user]);

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
