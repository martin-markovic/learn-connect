import { useState, useEffect, useRef, useMemo } from "react";
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

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState("");
  const selectRef = useRef(null);
  const { userId } = useParams();
  const {
    isLoading,
    userList = [],
    friendList = [],
  } = useSelector((state) => state.friends);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { examScores } = useSelector((state) => state.exam);

  const friendshipStatus = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(user?._id)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(user?._id))
    );
    return relation?.status ?? null;
  }, [friendList, userId, user?._id]);

  const isBlocked = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(user?._id)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(user?._id))
    );
    return relation?.status === "blocked";
  }, [friendList, userId, user?._id]);

  useEffect(() => {
    if (userId === user?._id || !isBlocked) {
      dispatch(getFriendList(userId));
    }

    dispatch(getUserList(userId));

    return () => {
      dispatch(resetExam());
      dispatch(resetUserList());
    };
  }, [dispatch, user?._id, userId, isBlocked]);

  useEffect(() => {
    dispatch(resetExam());
    dispatch(resetUserList());
  }, [userId, dispatch]);

  useEffect(() => {
    const selectedUser = userList.find((person) => person._id === userId);

    setUserInfo(selectedUser);
  }, [userList, userId]);

  useEffect(() => {
    const isFriend = friendList.find(
      (item) =>
        (item.senderId === String(userId) &&
          item.receiverId === String(user?._id)) ||
        (item.receiverId === String(userId) &&
          item.senderId === String(user?._id))
    )?.status;

    if (
      (isFriend === "accepted" || userId === user?._id) &&
      !examScores[userId]
    ) {
      dispatch(getExamScores(userId));
    }
  }, [friendList, userId, user?._id, friendshipStatus, examScores, dispatch]);

  useEffect(() => {
    socketEventManager.subscribe("user blocked", (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev._id === data ? null : prev));

      dispatch(getUserList());
      dispatch(getFriendList(user?._id));
    });

    socketEventManager.subscribe("friend request sent", (data) => {
      dispatch(newFriendRequest(data));
    });

    return () => {
      socketEventManager.unsubscribe("user blocked");
      socketEventManager.unsubscribe("friend request sent");
    };
  }, [dispatch, user?._id]);

  const handleSend = () => {
    try {
      if (!userId) {
        throw new Error("Invalid user id");
      }

      if (!user?._id) {
        throw new Error("User not authorized");
      }

      if (friendshipStatus === "sent" || friendshipStatus === "accepted") {
        const errorString =
          friendshipStatus === "sent"
            ? "Friend request already sent"
            : "You are already friends";

        throw new Error(errorString);
      }

      socketEventManager.handleEmitEvent("send friend request", {
        senderId: user._id,
        receiverId: userId,
        currentStatus: "pending",
      });
    } catch (error) {
      console.error("Error sending friend request: ", error.message);
    }
  };

  const handleProcessRequest = (e) => {
    setIsProcessing(true);

    const friendReqResponse = e.target.dataset.response;

    try {
      const eventData = {
        senderId: user?._id,
        receiverId: userId,
        userResponse: friendReqResponse === "accept" ? "accepted" : "declined",
      };

      socketEventManager.handleEmitEvent("process friend request", eventData);
    } catch (error) {
      console.error("Error processing request :", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;

    setModalOpen(true);
    setActionToConfirm(newStatus);
  };

  const handleConfirmAction = () => {
    try {
      const validActions = ["unfriend", "block"];

      if (!validActions.includes(actionToConfirm)) {
        throw new Error(`Invalid action ${actionToConfirm}`);
      }

      const actionName =
        actionToConfirm === "unfriend" ? "remove friend" : "block user";

      socketEventManager.handleEmitEvent(actionName, {
        senderId: user._id,
        receiverId: userId,
      });
    } catch (error) {
      console.error("Error removing friend: ", error.message);
    }

    setModalOpen(false);
  };

  const handleCancelAction = () => {
    setModalOpen(false);
    if (selectRef.current) {
      selectRef.current.value = "friends";
    }
  };

  if (!isLoading && isBlocked) {
    return <p>You cannot interact with this user.</p>;
  }

  if (!isLoading && !userInfo) {
    return <p>User not found.</p>;
  }

  return isLoading ? (
    <p>Loading,please wait...</p>
  ) : isEditing ? (
    <UserForm
      setIsEditing={setIsEditing}
      userDetails={{
        avatar: user?.avatar,
        email: user?.email,
        name: user?.name,
      }}
    />
  ) : (
    <div className="user__profile-container">
      <div
        className="user__profile-top__box
      "
      >
        <div>
          <div className="user__profile-avatar">
            {userInfo?.avatar ? (
              <img
                src={userInfo?.avatar}
                alt="user avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                }}
              >
                <FaCircleUser
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "grey",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <section>
          <h1>{userInfo?.name}</h1>
        </section>
        {String(user?._id) === String(userId) && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit Account Info
          </button>
        )}
        {String(user?._id) !== String(userId) && (
          <>
            {friendshipStatus === "pending" &&
              friendList.find(
                (item) =>
                  String(item.senderId) === String(user._id) &&
                  String(item.receiverId) === String(userId)
              ) && <button disabled={true}>Request Sent</button>}
            {friendshipStatus === "pending" &&
              friendList.find(
                (item) =>
                  String(item.receiverId) === String(user?._id) &&
                  String(item.senderId) === String(userId)
              ) && (
                <div>
                  <button
                    type="button"
                    data-response="accept"
                    disabled={isProcessing}
                    onClick={handleProcessRequest}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    data-response="decline"
                    disabled={isProcessing}
                    onClick={handleProcessRequest}
                  >
                    Decline
                  </button>
                </div>
              )}
            {friendshipStatus === "accepted" && (
              <div className="friendship-container">
                <select
                  name="friendshipStatus"
                  id="friendshipStatus"
                  defaultValue="friends"
                  onChange={handleStatusChange}
                  ref={selectRef}
                >
                  <option value="friends" hidden>
                    Friends
                  </option>
                  <option value="unfriend">Unfriend</option>
                  <option value="block">Block</option>
                </select>
              </div>
            )}
            <div className="modal">
              {modalOpen && (
                <div className="modal-container">
                  <p>
                    Are you sure you want to {actionToConfirm} {userInfo?.name}?
                  </p>
                  <div className="modal-buttons">
                    <button onClick={handleConfirmAction}>Yes</button>
                    <button onClick={handleCancelAction}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            {!isLoading && friendshipStatus === null && !modalOpen && (
              <div>
                <button type="button" onClick={handleSend}>
                  Add Friend
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(true);
                    setActionToConfirm("block");
                  }}
                >
                  Block User
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div
        className="user__profile-bottom__box
      "
      >
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
