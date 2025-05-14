import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../features/socket/socket.eventManager.js";
import {
  addMessage,
  markAsRead,
  markAllAsRead,
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

  const { user } = useSelector((state) => state.auth);
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

  const handleUserOffline = useCallback(
    (data) => {
      setOnlineList(onlineList.filter((f) => f !== data?.id));
    },
    [onlineList]
  );

  useEffect(() => {
    if (!user?._id) {
      isInitialized.current = false;
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
    handleNewMessage,
    handleMarkAsRead,
    handleChatActivity,
    handleMarkAllAsRead,
    handleConnect,
    handleUserOnline,
    handleUserOffline,
  ]);

  useEffect(() => {
    if (!user?._id) {
      isInitialized.current = false;
    }
  }, [user?._id]);

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
