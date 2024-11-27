import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFriendRequest,
  getUserList,
  getFriendList,
  handleAccept,
  handleDecline,
  handleRemove,
  handleBlock,
} from "../features/friend/friendSlice.js";
import handleSocialEvent from "../features/socket/controller/handleSocialEvent.js";

function UserProfile({ socketInstance }) {
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
    const isFriend = friendList.forEach(
      (item) => item.sender_id === userId || item.receiver._id === userId
    );

    setFriendshipStatus(isFriend || null);
  }, [friendList, userId]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("friend request sent", (data) => {
        console.log("friend request data: ", data);
        dispatch(sendFriendRequest(data));
      });

      socketInstance.on("friend request declined", (data) => {
        dispatch(handleDecline(data));
      });

      socketInstance.on("friend request accepted", (data) => {
        dispatch(handleAccept(data));
      });

      socketInstance.on("friend removed", (data) => {
        dispatch(handleRemove(data));
      });

      socketInstance.on("user blocked", (data) => {
        dispatch(handleBlock(data));

        setUserInfo((prev) => (prev._id === data ? null : prev));
        setFriendshipStatus("blocked");

        dispatch(getUserList());
        dispatch(getFriendList());
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("friend request sent");
        socketInstance.off("friend request accepted");
        socketInstance.off("friend request declined");
        socketInstance.off("friend removed");
        socketInstance.off("user blocked");
      }
    };
  }, [dispatch, socketInstance]);

  const handleSend = () => {
    try {
      if (!userId) {
        throw new Error("Invalid user id");
      }

      if (friendshipStatus === "sent" || friendshipStatus === "accepted") {
        const errorString =
          friendshipStatus === "sent"
            ? "Friend request already sent"
            : "You are already friends";

        throw new Error(errorString);
      }

      const eventData = {
        senderId: user._id,
        receiverId: userId,
        currentStatus: "pending",
      };

      const clientData = {
        socketInstance,
        eventName: "send friend request",
        eventData,
      };

      handleSocialEvent(clientData);
    } catch (error) {
      console.error(error.message);

  const handleProcessRequest = (e) => {
    setIsProcessing(true);

    const friendReqResponse = e.target.dataset.response;

    try {
      const eventData = {
        senderId: userId,
        receiverId: user._id,
        userResponse: friendReqResponse === "accept" ? "accepted" : "declined",
      };

      const clientData = {
        socketInstance,
        eventName: "process friend request",
        eventData,
      };

      handleSocialEvent(clientData);
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

      const clientData = {
        socketInstance,
        eventName: "remove friend",
        eventData,
      };

      handleSocialEvent(clientData);
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
            userId ===
              friendList.find((item) => item.receiver === userId)?.receiver && (
              <button disabled={true}>Request Sent</button>
            )}

          {friendshipStatus === "pending" &&
            userId ===
              friendList.find((item) => item.sender === userId)?.sender && (
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
            </div>
          )}
          {!isLoading && friendshipStatus === null && (
            <button type="button" onClick={handleSend}>
              Add Friend
            </button>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => {
          console.log("friendList: ", friendList);
        }}
      >
        Log friend list
      </button>
    </div>
  );
}

export default UserProfile;
