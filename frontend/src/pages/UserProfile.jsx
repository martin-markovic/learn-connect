import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFriendRequest,
  getUserList,
  getFriendList,
  handleFriendRequest,
} from "../features/friend/friendSlice.js";
import handleSocialEvent from "../features/socket/controller/handleSocialEvent.js";

function UserProfile({ socketInstance }) {
  const [userInfo, setUserInfo] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

      socketInstance.on("friend request processed", (data) => {
        const { senderId, status } = data;

        if (user?._id === senderId) {
          dispatch(
            handleFriendRequest({ sender: user?._id, receiver: userId, status })
          );
        } else {
          dispatch(
            handleFriendRequest({ sender: userId, receiver: user?._id, status })
          );
        }
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("friend request sent");
        socketInstance.off("friend request processed");
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
            <select name="friendshipStatus" id="friendshipStatus">
              <label for="friendshipStatus">Friends</label>
              <option value="unfriend">Unfriend</option>
            </select>
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
