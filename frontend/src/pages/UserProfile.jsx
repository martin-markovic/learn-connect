import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFriendRequest,
  getUserList,
  getFriendList,
  handleFriendRequest,
} from "../features/friend/friendSlice.js";

function UserProfile({ socketInstance }) {
  const [userInfo, setUserInfo] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
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
    const isFriend = friendList.includes(userId);

    setFriendshipStatus(isFriend || null);
  }, [friendList, userId]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("friend request sent", (data) => {
        console.log("friend request data: ", data);
        dispatch(sendFriendRequest(data));
      });

      socketInstance.on("friend request processed", (data) => {
        const { sender, status } = data;

        if (user?._id === sender) {
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
        throw new Error("Invalid user requested");
      }

      if (friendshipStatus === "sent" || friendshipStatus === "accepted") {
        const errorString =
          friendshipStatus === "sent"
            ? "Friend request already sent"
            : "You are already friends";

        throw new Error(errorString);
      }

      dispatch(sendFriendRequest(userId));
    } catch (error) {
      console.error(error.message);
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
                  onClick={() => {
                    dispatch(
                      handleFriendRequest({
                        friendReqResponse: "accept",
                        userId,
                      })
                    );
                  }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      handleFriendRequest({
                        friendReqResponse: "decline",
                        userId,
                      })
                    );
                  }}
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
