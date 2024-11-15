import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendFriendRequest,
  getUserList,
  getFriendList,
} from "../features/friend/friendSlice.js";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const { userId } = useParams();
  const { userList, friendList } = useSelector((state) => state.friends);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserList());
    dispatch(getFriendList());
  }, [dispatch]);

  useEffect(() => {
    const selectedUser = userList.find((person) => person._id === userId);

    setUserInfo(selectedUser);
  }, [userList, userId]);

  const handleClick = () => {
    try {
      if (!userId) {
        throw new Error("Invalid user requested");
      }

      console.log("button clicked: ", userInfo);

      const friendShipStatus = friendList[userId];

      if (friendShipStatus === "sent" || friendShipStatus === "accepted") {
        throw new Error("Friend request already sent");
      }

      dispatch(sendFriendRequest(userId));
    } catch (error) {
      console.error(error.message);
    }
  };

  if (!userInfo) {
    return <p>User not found.</p>;
  }

  return (
    <div>
      <h1>{userInfo.name}</h1>
      <button type="button" onClick={handleClick}>
        Add friend
      </button>
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
