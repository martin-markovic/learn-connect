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
      <div className="dashboard-left__box">
        <div className="left__box-top">
          <UserNotifications />
        </div>
        <div className="left__box-bottom">
          <FriendSearch />
        </div>
      </div>
      <div className="dashboard-right__box">
        <div className="right__box-top">
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
                  width: "60px",
                  height: "60px",
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
                  border: "solid grey 1px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "grey",
                }}
              >
                <FaCircleUser
                  style={{ width: "100%", height: "100%", color: "white" }}
                  title="visit your profile"
                />
              </div>
            )}
          </div>
          <span>{user?.name}</span>
          <Classroom />
        </div>
        <ChatProvider>
          <div className="right__box-bottom">
            <Chat />
          </div>
        </ChatProvider>
      </div>
    </main>
  );
}
