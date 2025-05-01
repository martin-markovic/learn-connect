import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserList,
  getFriendList,
  handleBlock,
  newFriendRequest,
} from "../features/friend/friendSlice.js";
import socketEventManager from "../features/socket/socket.eventManager.js";
import { FaCircleUser } from "react-icons/fa6";

import UserForm from "../components/users/UserForm.jsx";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
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

  useEffect(() => {
    dispatch(getUserList());
    dispatch(getFriendList());
  }, [dispatch]);

  useEffect(() => {
    const selectedUser = userList.find((person) => person._id === userId);

    setUserInfo(selectedUser);
  }, [userList, userId]);

  useEffect(() => {
    const isFriend = friendList.find(
      (item) => item.senderId === userId || item.receiverId === userId
    )?.status;

    setFriendshipStatus(isFriend || null);
  }, [friendList, userId]);

  useEffect(() => {
    socketEventManager.subscribe("user blocked", (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev._id === data ? null : prev));
      setFriendshipStatus("blocked");

      dispatch(getUserList());
      dispatch(getFriendList());
    });

    socketEventManager.subscribe("friend request sent", (data) => {
      dispatch(newFriendRequest(data));
    });

    return () => {
      socketEventManager.unsubscribe("user blocked");
      socketEventManager.unsubscribe("friend request sent");
    };
  }, [dispatch]);

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

  if (!isLoading && friendshipStatus === "blocked") {
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
    <div>
      <div className="avatar-wrapper">
        {userInfo?.avatar ? (
          <img
            src={userInfo?.avatar}
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
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "solid grey 1px",
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
                color: "black",
              }}
            />
          </div>
        )}
      </div>
      <h1>{userInfo?.name}</h1>
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
            <div>
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
          {modalOpen && (
            <div className="modal">
              <p>
                Are you sure you want to {actionToConfirm} {userInfo?.name}?
              </p>
              <div>
                <button onClick={handleConfirmAction}>Yes</button>
                <button onClick={handleCancelAction}>No</button>
              </div>
            </div>
          )}
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
      {String(user?._id) === String(userId) && (
        <>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit Account Info
          </button>
          {friendList.length ? (
            <div>
              <p>{user?.name.split(" ")[0]}&apos;s friends</p>
              {friendList.map((friend, index) =>
                friend?.status === "accepted" ? (
                  <div
                    className="clickable"
                    key={`friend-${index}`}
                    onClick={() => {
                      navigate(
                        `/profile/${
                          friend?.senderId === user?._id
                            ? friend?.receiverId
                            : friend?.senderId
                        }`
                      );
                    }}
                  >
                    {(
                      friend?.senderId === user?._id
                        ? friend?.receiverAvatar
                        : friend?.senderAvatar
                    ) ? (
                      <img
                        alt="user avatar"
                        src={
                          friend?.senderId === user?._id
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
                      <FaCircleUser />
                    )}
                    <p>
                      {friend?.senderId === user?._id
                        ? friend?.receiverName
                        : friend?.senderName}
                    </p>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <p>Friend list is empty</p>
          )}
        </>
      )}
    </div>
  );
}

export default UserProfile;
