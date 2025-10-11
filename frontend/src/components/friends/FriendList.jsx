import { FaCircleUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function FriendList({ friendList = [], userId }) {
  const navigate = useNavigate();

  if (!Array.isArray(friendList) || friendList.length === 0) {
    return <p>Friend list is empty</p>;
  }

  return (
    <div className="user__profile-friendlist-container">
      <h4>Friends</h4>
      <ul className="user__profile-list">
        {friendList.map((friend, index) =>
          friend?.status === "accepted" ? (
            <li
              title={`visit ${
                friend?.senderId === userId
                  ? friend?.receiverName?.split(" ")[0]
                  : friend.senderName?.split(" ")[0]
              }'s profile`}
              className="user__profile-list__entry list__item-friend clickable"
              key={`friend-${index}`}
              onClick={() => {
                navigate(
                  `/profile/${
                    friend?.senderId === userId
                      ? friend?.receiverId
                      : friend?.senderId
                  }`
                );
              }}
            >
              {(
                friend?.senderId === userId
                  ? friend?.receiverAvatar
                  : friend?.senderAvatar
              ) ? (
                <img
                  alt="user avatar"
                  src={
                    friend?.senderId === userId
                      ? friend?.receiverAvatar
                      : friend?.senderAvatar
                  }
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
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "white",
                  }}
                >
                  <FaCircleUser
                    style={{
                      height: "100%",
                      width: "100%",
                      color: "grey",
                    }}
                  />
                </div>
              )}
              <p style={{ width: "100%", textAlign: "center" }}>
                {friend?.senderId === userId
                  ? friend?.receiverName
                  : friend?.senderName}
              </p>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
