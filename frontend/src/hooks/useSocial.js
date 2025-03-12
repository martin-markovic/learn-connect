import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  resetUserList,
  newFriendRequest,
  handleDecline,
  handleAccept,
  handleRemove,
  handleBlock,
  getUserList,
  getFriendList,
} from "../features/friend/friendSlice.js";
import socketEventManager from "../features/socket/socket.eventManager.js";

const useSocial = (user, setUserInfo, setFriendshipStatus) => {
  const dispatch = useDispatch();

  const handleSendRequest = useCallback(
    (data) => {
      dispatch(newFriendRequest(data));
    },
    [dispatch]
  );

  const handleIncomingRequest = useCallback(
    (data) => {
      dispatch(newFriendRequest(data));

      socketEventManager.handleEmitEvent("new notification", {
        senderId: data?.senderId,
        receiverId: data?.receiverId,
        notificationName: "new friend request",
      });
    },
    [dispatch]
  );

  const handleDeclineRequest = useCallback(
    (data) => {
      dispatch(handleDecline(data));
    },
    [dispatch]
  );

  const handleAcceptRequest = useCallback(
    (data) => {
      dispatch(handleAccept(data));

      if (data?.receiverId === user?._id) {
        const notificationData = {
          senderId: data?.receiverId,
          receiverId: data?.senderId,
          notificationName: "friend request accepted",
        };

        socketEventManager.handleEmitEvent(
          "new notification",
          notificationData
        );
      }
    },
    [dispatch, user?._id]
  );

  const handleRemoveUser = useCallback(
    (data) => {
      dispatch(handleRemove(data));
    },
    [dispatch]
  );

  const handleBlockUser = useCallback(
    (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev._id === data ? null : prev));
      setFriendshipStatus("blocked");

      dispatch(getUserList());
      dispatch(getFriendList());
    },
    [dispatch, setUserInfo, setFriendshipStatus]
  );

  useEffect(() => {
    const subscriptions = [
      ["friend request sent", handleSendRequest],
      ["friend request received", handleIncomingRequest],
      ["friend request declined", handleDeclineRequest],
      ["friend request accepted", handleAcceptRequest],
      ["friend removed", handleRemoveUser],
      ["user blocked", handleBlockUser],
    ];

    subscriptions.forEach(([eventName, eventHandler]) => {
      socketEventManager.subscribe(eventName, eventHandler);
    });

    return () => {
      subscriptions.forEach(([eventName, eventHandler]) => {
        socketEventManager.unsubscribe(eventName, eventHandler);
      });

      dispatch(resetUserList());
    };
  }, [
    dispatch,
    handleSendRequest,
    handleIncomingRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleRemoveUser,
    handleBlockUser,
  ]);
};

export default useSocial;
