import ChatProvider from "../context/chatContext.js";
import { useSelector } from "react-redux";
import { FaCircleUser } from "react-icons/fa6";

import Chat from "../components/chat/Chat.jsx";
import FriendSearch from "../components/friends/FriendSearch.jsx";
import Classroom from "../components/classroom/Classroom.jsx";
import UserNotifications from "../components/UserNotifications.jsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <main className="dashboard-container">
      <div className="left-box">
        <div className="user-details">
          <div
            className="avatar-wrapper clickable"
            onClick={() => {
              navigate(`/profile/${user?._id}`);
            }}
          >
            {user?.avatar ? (
              <img
                title="visit your profile"
                src={user?.avatar}
                alt="user avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                }}
              >
                <FaCircleUser
                  style={{ width: "100%", height: "100%", color: "grey" }}
                  title="visit your profile"
                />
              </div>
            )}
          </div>
          {user?.name && <h1>{user?.name}</h1>}
        </div>
        <div className="dashboard-classroom">
          <Classroom />
        </div>
      </div>
      <div className="right-box">
        <div className="right__box-left">
          <div className="dashboard-notifications">
            <UserNotifications />
          </div>
          <FriendSearch />
        </div>
        <div className="right__box-right">
          <ChatProvider>
            <Chat />
          </ChatProvider>
        </div>
      </div>
    </main>
  );
}
