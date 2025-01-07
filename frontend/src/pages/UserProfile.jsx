import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetUserList,
  getUserList,
  getFriendList,
  newFriendRequest,
  handleDecline,
  handleAccept,
  handleRemove,
  handleBlock,
} from "../features/friend/friendSlice.js";
import socketEventManager from "../features/socket/socket.eventManager.js";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
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
      (item) => item.receiverId === userId || item.senderId === userId
    )?.status;

    setFriendshipStatus(isFriend || null);
  }, [friendList, userId]);

  useEffect(() => {
    socketEventManager.subscribe("friend request sent", (data) => {
      console.log("FRQ sent event data: ", data);
      dispatch(newFriendRequest(data));
    });

    socketEventManager.subscribe("friend request received", (data) => {
      console.log("FRQ received event data: ", data);
      dispatch(newFriendRequest(data));

      socketEventManager.handleEmitEvent("new notification", {
        senderId: data?.sender,
        receiverId: data?.receiver,
        notificationName: "new friend request",
      });
    });

    socketEventManager.subscribe("friend request declined", (data) => {
      dispatch(handleDecline(data));
    });

    socketEventManager.subscribe("friend request accepted", (data) => {
      console.log("accepted request: ", data);
      dispatch(handleAccept(data));

      socketEventManager.handleEmitEvent("new notification", {
        senderId: data?.sender,
        receiverId: data?.receiver,
        notificationName: "friend request accepted",
      });
    });

    socketEventManager.subscribe("friend removed", (data) => {
      dispatch(handleRemove(data));
    });

    socketEventManager.subscribe("user blocked", (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev._id === data ? null : prev));
      setFriendshipStatus("blocked");

      dispatch(getUserList());
      dispatch(getFriendList());
    });

    return () => {
      socketEventManager.unsubscribe("friend request sent");
      socketEventManager.unsubscribe("friend request received");
      socketEventManager.unsubscribe("friend request accepted");
      socketEventManager.unsubscribe("friend request declined");
      socketEventManager.unsubscribe("friend removed");
      socketEventManager.unsubscribe("user blocked");
      dispatch(resetUserList());
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
        senderId: userId,
        receiverId: user?._id,
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
      const eventData = {
        senderId: user._id,
        receiverId: userId,
      };

      const validActions = ["unfriend", "block"];

      if (!validActions.includes(actionToConfirm)) {
        throw new Error(`Invalid action ${actionToConfirm}`);
      }

      const actionName =
        actionToConfirm === "unfriend" ? "remove friend" : "block user";

      const clientData = {
        socketInstance,
        eventName: actionName,
        eventData,
      };

      emitEvent(clientData);
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
  ) : (
    <div>
      <h1>{userInfo.name}</h1>
      {String(user?._id) !== String(userId) && (
        <>
          {friendshipStatus === "pending" &&
            friendList.find((item) => item.senderId === user._id) && (
              <button disabled={true}>Request Sent</button>
            )}
          {friendshipStatus === "pending" &&
            friendList.find((item) => item.receiverId === user?._id) && (
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
    </div>
  );
}

export default UserProfile;
