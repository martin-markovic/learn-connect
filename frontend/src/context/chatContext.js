import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../features/socket/socket.eventManager.js";
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

  const selectedChatRef = useRef(null);
  const activityTimer = useRef(null);
  const isInitialized = useRef(false);
  const isSubscribed = useRef(false);
  const chatStatus = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const online = useSelector((state) => state.chat.online);
  const dispatch = useDispatch();

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

      if (data?.success) {
        dispatch(changeChatStatus(data?.online));

        chatStatus.current = data?.online ? "reconnected" : "disconnected";
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!user?._id) {
      isSubscribed.current = false;
      return;
    }

    if (isSubscribed.current || !user?._id) return;

    socketEventManager.subscribe("chat status changed", handleChatStatus);


    isSubscribed.current = true;

    return () => {
      socketEventManager.unsubscribe("chat status changed");
    };
  }, [user?._id, handleChatStatus]);

  useEffect(() => {
    if (!user?._id) {
      isInitialized.current = false;
      return;
    }

    if (!online) {
      return;
    }

    if (isInitialized.current || !user?._id) return;

    const subscriptions = [
      { event: "new message", handler: handleNewMessage },
      { event: "message seen", handler: handleMarkAsRead },
      { event: "chat activity", handler: handleChatActivity },
      { event: "messages read", handler: handleMarkAllAsRead },
      { event: "user connected", handler: handleConnect },
      { event: "friend connected", handler: handleUserOnline },
      {
        event: "friend disconnected",
        handler: handleUserOffline,
      },
    ];

    subscriptions.forEach(({ event, handler }) => {
      socketEventManager.subscribe(event, handler);
    });

    isInitialized.current = true;

    return () => {
      subscriptions.forEach(({ event }) => {
        socketEventManager.unsubscribe(event);
      });
      isInitialized.current = false;
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
  ]);

  useEffect(() => {
    if (!user?._id) {
      isInitialized.current = false;
    }
  }, [user?._id]);

  useEffect(() => {
    if (!isInitialized.current) return;

    const subscriptions = [
      { event: "new message", handler: handleNewMessage },
      { event: "message seen", handler: handleMarkAsRead },
      { event: "chat activity", handler: handleChatActivity },
      { event: "messages read", handler: handleMarkAllAsRead },
      { event: "user connected", handler: handleConnect },
      { event: "friend connected", handler: handleUserOnline },
      {
        event: "friend disconnected",
        handler: handleUserOffline,
      },
    ];

    if (chatStatus.current === "reconnected") {

      subscriptions.forEach(({ event, handler }) => {
        socketEventManager.subscribe(event, handler);
      });

      dispatch(getMessages());

      chatStatus.current = null;
    }

    if (chatStatus.current === "disconnected") {
      console.log("disconnecting chat events");

      subscriptions.forEach((event) => {
        socketEventManager.unsubscribe(event);
      });

      chatStatus.current = null;
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
