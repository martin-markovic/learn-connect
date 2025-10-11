import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserList,
  getFriendList,
  handleBlock,
  newFriendRequest,
  resetUserList,
} from "../features/friend/friendSlice.js";
import {
  getExamScores,
  resetExam,
} from "../features/quizzes/exam/examSlice.js";
import socketEventManager from "../features/socket/managers/socket.eventManager.js";
import { FaCircleUser } from "react-icons/fa6";

import UserForm from "../components/users/UserForm.jsx";
import ProfileHeader from "../components/users/ProfileHeader.jsx";
import FriendshipModal from "../components/friends/FriendshipModal.jsx";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { userId } = useParams();
  const {
    isLoading,
    userList = [],
    friendList = [],
  } = useSelector((state) => state.friends);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id: authUserId, name: userName } = useSelector(
    (state) => state.auth.user
  );
  const { examScores } = useSelector((state) => state.exam);

  const friendshipStatus = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(authUserId)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(authUserId))
    );
    return relation?.status ?? null;
  }, [friendList, userId, authUserId]);

  const isBlocked = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(authUserId)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(authUserId))
    );
    return relation?.status === "blocked";
  }, [friendList, userId, authUserId]);

  useEffect(() => {
    if (userId === authUserId || !isBlocked) {
      dispatch(getFriendList(userId));
    }

    dispatch(getUserList(userId));

    return () => {
      dispatch(resetExam());
      dispatch(resetUserList());
    };
  }, [dispatch, authUserId, userId, isBlocked]);

  useEffect(() => {
    dispatch(resetExam());
    dispatch(resetUserList());
  }, [userId, dispatch]);

  useEffect(() => {
    if (!userList.length || isLoading || !authUserId) return;

    const userFound = userList.find(
      (item) => item.sender._id === userId || item.receiver?._id === userId
    );

    if (!userFound.status || userFound.status === "blocked") return;

    const selectedUser =
      userFound.receiver._id === userId ? userFound.receiver : userFound.sender;

    setUserInfo(selectedUser);
  }, [userList, userId, isLoading, authUserId]);

  useEffect(() => {
    const isFriend = friendList.find(
      (item) =>
        (item.senderId === String(userId) &&
          item.receiverId === String(authUserId)) ||
        (item.receiverId === String(userId) &&
          item.senderId === String(authUserId))
    )?.status;

    if (
      (isFriend === "accepted" || userId === authUserId) &&
      !examScores[userId]
    ) {
      dispatch(getExamScores(userId));
    }
  }, [friendList, userId, authUserId, friendshipStatus, examScores, dispatch]);

  useEffect(() => {
    socketEventManager.subscribe("user blocked", (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev._id === data ? null : prev));

      dispatch(getUserList());
      dispatch(getFriendList(authUserId));
    });

    socketEventManager.subscribe("friend request sent", (data) => {
      dispatch(newFriendRequest(data));
    });

    return () => {
      socketEventManager.unsubscribe("user blocked");
      socketEventManager.unsubscribe("friend request sent");
    };
  }, [dispatch, authUserId]);

  if (!isLoading && isBlocked) {
    return <p>You cannot interact with this user.</p>;
  }

  if (!isLoading && !userInfo) {
    return <p>User not found.</p>;
  }

  return isLoading ? (
    <p>Loading,please wait...</p>
  ) : isEditing ? (
    <UserForm setIsEditing={setIsEditing} />
  ) : (
    <div className="user__profile-container">
      <div className="user__profile-top__box">
        <div>
          <ProfileHeader userInfo={userInfo} />
        </div>

        <section>
          <h1>{userInfo?.name}</h1>
        </section>
        {String(authUserId) === String(userId) && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit Account Info
          </button>
        )}
        {String(authUserId) !== String(userId) && (
          <FriendshipModal
            modalData={{
              friendshipStatus,
              friendList,
              authUserId,
              userId,
              userName,
            }}
          />
        )}
      </div>
      <div className="user__profile-bottom__box">
        <div className="user__profile-bottom__box-content">
          {friendList.length ? (
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
          ) : (
            <p>Friend list is empty</p>
          )}
        </div>
        <div className="user__profile-bottom__box-content">
          <h2>Classroom Space</h2>
        </div>
        <div className="user__profile-bottom__box-content">
          <h4>Recent Quiz Scores</h4>
          <ul className="user__profile-list">
            {examScores[userId]?.length ? (
              examScores[userId]?.map((entry) => {
                return (
                  <li
                    className="user__profile-list__entry list__item-quiz"
                    key={entry?.quiz?.quizId}
                  >
                    <p className="quiz__entry-title">
                      {entry?.quiz?.quizTitle}
                    </p>
                    <div className="quiz__entry-scores">
                      <div className="quiz__entry-scores-item">
                        <div>Last score:</div>
                        <div>{entry?.latestScore}</div>
                      </div>
                      <div className="quiz__entry-scores-item">
                        <div>High score:</div>
                        <div>{entry?.highScore}</div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <p>User has no quiz records</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
