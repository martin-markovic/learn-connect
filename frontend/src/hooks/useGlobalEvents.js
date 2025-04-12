import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { finishExam } from "../features/quizzes/exam/examSlice.js";
import {
  newFriendRequest,
  handleDecline,
  handleAccept,
  handleRemove,
} from "../features/friend/friendSlice.js";
import { addNewNotification } from "../features/notifications/notificationSlice.js";
import socketEventManager from "../features/socket/socket.eventManager.js";

const useGlobalEvents = (currentLocation, user) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFinishExam = useCallback(
    (data) => {
      dispatch(finishExam(data));

      socketEventManager.handleEmitEvent("new notification", {
        senderId: data?.scorePayload?.user,
        quizId: data?.scorePayload?.quiz,
        quizScore: data?.scorePayload?.latestScore,
        notificationName: "quiz graded",
      });

      if (currentLocation.startsWith(`/exam/${data?.scorePayload?.quizId}`)) {
        navigate("/");
      }
    },
    [currentLocation, dispatch, navigate]
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

  const handleNewNotification = useCallback(
    (data) => {
      dispatch(addNewNotification(data));
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
          senderId: data?.senderId,
          receiverId: data?.receiverId,
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

  useEffect(() => {
    if (
      !currentLocation.startsWith("/register") &&
      !currentLocation.startsWith("/login")
    ) {
      const subscriptions = [
        ["exam finished", handleFinishExam],
        ["notification received", handleNewNotification],
        ["friend request received", handleIncomingRequest],
        ["friend request declined", handleDeclineRequest],
        ["friend request accepted", handleAcceptRequest],
        ["friend removed", handleRemoveUser],
      ];

      subscriptions.forEach(([eventName, eventHandler]) => {
        socketEventManager.subscribe(eventName, eventHandler);
      });

      return () => {
        subscriptions.forEach(([eventName, eventHandler]) => {
          socketEventManager.unsubscribe(eventName, eventHandler);
        });
      };
    }
  }, [
    currentLocation,
    handleAcceptRequest,
    handleDeclineRequest,
    handleFinishExam,
    handleIncomingRequest,
    handleNewNotification,
    handleRemoveUser,
  ]);
};

export default useGlobalEvents;
