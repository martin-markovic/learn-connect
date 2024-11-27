import {
  getUserList,
  getFriendList,
  newFriendRequest,
  handleAccept,
  handleDecline,
  handleRemove,
  handleBlock,
} from "../../../friend/friendSlice.js";

const initSocialEvents = (initData) => {
  const { socketInstance, dispatch, callbackHandlers } = initData;

  if (!socketInstance || !dispatch || !callbackHandlers) {
    console.error("Please provide valid socket initialization data");

    return () => {};
  }

  const { setUserInfo, setFriendshipStatus } = callbackHandlers;

  try {
    socketInstance.on("friend request sent", (data) => {
      try {
        dispatch(newFriendRequest(data));
      } catch (error) {
        console.error("Error sending friend request: ", error.message);
      }
    });

    socketInstance.on("new friend request", (data) => {
      try {
        dispatch(newFriendRequest(data));
      } catch (error) {
        console.error("Error handling new friend request: ", error.message);
      }
    });

    socketInstance.on("friend request declined", (data) => {
      try {
        dispatch(handleDecline(data));
      } catch (error) {
        console.error("Error declining a friend request: ", error.message);
      }
    });

    socketInstance.on("friend request accepted", (data) => {
      try {
        dispatch(handleAccept(data));
      } catch (error) {
        console.error("Error accepting friend request: ", error.message);
      }
    });

    socketInstance.on("friend removed", (data) => {
      try {
        dispatch(handleRemove(data));
      } catch (error) {
        console.error("Error removing a friend: ", error.message);
      }
    });

    socketInstance.on("user blocked", (data) => {
      try {
        dispatch(handleBlock(data));

        setUserInfo((prev) => (prev._id === data ? null : prev));
        setFriendshipStatus("blocked");

        dispatch(getUserList());
        dispatch(getFriendList());
      } catch (error) {
        console.error("Error blocking a user: ", error.message);
      }
    });
  } catch (error) {
    console.error("Error setting up socket events: ", error.message);
  }

  return () => {
    try {
      socketInstance.off("friend request sent");
      socketInstance.off("new friend request");
      socketInstance.off("friend request accepted");
      socketInstance.off("friend request declined");
      socketInstance.off("friend removed");
      socketInstance.off("user blocked");
    } catch (error) {
      console.error("Error during cleanup:", error.message);
    }
  };
};

export default initSocialEvents;
