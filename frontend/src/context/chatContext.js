import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../features/socket/managers/socket.eventManager.js";
import {
  addMessage,
  markAsRead,
  markAllAsRead,
  changeChatStatus,
  getMessages,
} from "../features/chat/chatSlice.js";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activity, setActivity] = useState("");
  const [chatScroll, setChatScroll] = useState({
    isScrolling: false,
    eventType: null,
  });
  const [onlineList, setOnlineList] = useState([]);
  const [chatReady, setChatReady] = useState({
    isInitialized: false,
    isSubscribed: false,
    chatStatus: null,
  });

  const selectedChatRef = useRef(null);
  const activityTimer = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const online = useSelector((state) => state.chat.online);
  const dispatch = useDispatch();

  const { isInitialized, isSubscribed, chatStatus } = chatReady;

  useEffect(() => {
    if (!isInitialized || !isSubscribed || !online || chatStatus !== null)
      return;

    setChatReady((prevState) => ({
      ...prevState,
      chatStatus: "connected",
    }));
  }, [isInitialized, isSubscribed, online, chatStatus]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const handleNewMessage = useCallback(
    (data) => {
      const messagePayload = {
        friendId:
          data?.senderId === user?._id ? data?.receiverId : data?.senderId,
        data,
      };

      dispatch(addMessage(messagePayload));

      setActivity("");
      setChatScroll((prevState) => ({
        ...prevState,
        isScrolling: true,
        eventType: "new message",
      }));

      if (
        selectedChatRef.current?.id &&
        data?.senderId === selectedChatRef.current?.id
      ) {
        socketEventManager.handleEmitEvent("message read", {
          senderId: user?._id,
          receiverId: data?.senderId,
          messageId: data?._id,
        });
      }
    },
    [dispatch, user?._id]
  );

  const handleMarkAsRead = useCallback(
    (data) => {
      dispatch(
        markAsRead({
          messageId: data?.messageId,
          friendId:
            data?.senderId === user?._id ? data?.receiverId : data?.senderId,
        })
      );
    },
    [dispatch, user?._id]
  );

  const handleChatActivity = useCallback(
    (data) => {
      const { senderName } = data;

      setActivity(`${senderName} is typing...`);

      if (activityTimer.current) clearTimeout(activityTimer.current);
      activityTimer.current = setTimeout(() => {
        setActivity("");
      }, 2000);
    },
    [activityTimer]
  );

  const handleMarkAllAsRead = useCallback(
    (data) => {
      dispatch(markAllAsRead(data));
    },
    [dispatch]
  );

  const handleConnect = useCallback((data) => {
    setOnlineList([...data?.payloadList]);
  }, []);

  const handleUserOnline = useCallback((data) => {
    setOnlineList((prevState) => [...prevState, data?.id]);
  }, []);

  const handleUserOffline = useCallback((data) => {
    setOnlineList((prev) => prev.filter((f) => f !== data?.id));
  }, []);

  const handleChatStatus = useCallback(
    (data) => {
      if (!data?.success) return;

      dispatch(changeChatStatus(data?.online));

      setChatReady((prevState) => ({
        ...prevState,
        chatStatus: data?.online
          ? prevState.chatStatus === null
            ? "connected"
            : "reconnected"
          : "disconnected",
      }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!user?._id) {
      setChatReady((prevState) => ({
        ...prevState,
        isSubscribed: false,
      }));
      return;
    }

    if (isSubscribed || !user?._id) return;

    socketEventManager.subscribe("chat status changed", handleChatStatus);

    setChatReady((prevState) => ({ ...prevState, isSubscribed: true }));

    return () => {
      socketEventManager.unsubscribe("chat status changed");
    };
  }, [user?._id, handleChatStatus, isSubscribed]);

  const socketSubscriptions = [
    { event: "new message", handler: handleNewMessage },
    { event: "message seen", handler: handleMarkAsRead },
    { event: "chat activity", handler: handleChatActivity },
    { event: "messages read", handler: handleMarkAllAsRead },
    { event: "user connected", handler: handleConnect },
    { event: "friend connected", handler: handleUserOnline },
    { event: "friend disconnected", handler: handleUserOffline },
  ];

  useEffect(() => {
    if (!user?._id) {
      setChatReady((prevState) => ({
        ...prevState,
        isInitialized: false,
      }));
      return;
    }

    if (!online) {
      return;
    }

    if (isInitialized || !user?._id) return;

    socketSubscriptions.forEach(({ event, handler }) => {
      socketEventManager.subscribe(event, handler);
    });

    socketEventManager.handleEmitEvent("connect chat", {
      senderId: user?._id,
    });

    setChatReady((prevState) => ({ ...prevState, chatInitialized: true }));

    return () => {
      socketSubscriptions.forEach(({ event }) => {
        socketEventManager.unsubscribe(event);
      });

      setOnlineList([]);
    };
  }, [
    dispatch,
    user?._id,
    online,
    handleNewMessage,
    handleMarkAsRead,
    handleChatActivity,
    handleMarkAllAsRead,
    handleConnect,
    handleUserOnline,
    handleUserOffline,
    handleChatStatus,
    isInitialized,
  ]);

  useEffect(() => {
    if (!isInitialized) return;

    if (chatStatus === "reconnected") {
      socketSubscriptions.forEach(({ event, handler }) => {
        socketEventManager.subscribe(event, handler);
      });

      dispatch(getMessages());

      socketEventManager.handleEmitEvent("reconnect chat", {
        userId: user?._id,
      });
    }

    if (chatStatus === "disconnected") {
      socketSubscriptions.forEach((event) => {
        socketEventManager.unsubscribe(event);
      });
    }
  }, [
    online,
    handleNewMessage,
    handleMarkAsRead,
    handleChatActivity,
    handleMarkAllAsRead,
    handleConnect,
    handleUserOnline,
    handleUserOffline,
    dispatch,
    user?._id,
    isInitialized,
    chatStatus,
  ]);

  const chatState = {
    selectedChat,
    setSelectedChat,
    activity,
    setActivity,
    chatScroll,
    setChatScroll,
    onlineList,
  };

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};

export { ChatContext };

export default ChatProvider;
