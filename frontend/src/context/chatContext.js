import { createContext, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../features/socket/socket.eventManager.js";
import {
  resetChat,
  addMessage,
  markAsRead,
  markAllAsRead,
} from "../features/chat/chatSlice.js";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  const [activity, setActivity] = useState("");
  const [scrollToBottom, setScrollToBottom] = useState(false);

  const activityTimer = useRef(null);
  const isInitialized = useRef(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isInitialized.current) return;

    socketEventManager.subscribe("new message", (data) => {
      const messagePayload = {
        friendId:
          data?.senderId === user?._id ? data?.receiverId : data?.senderId,
        data,
      };

      dispatch(addMessage(messagePayload));

      setScrollToBottom(true);

      setActivity("");

      if (selectedChat && data?.senderId === selectedChat) {
        socketEventManager.handleEmitEvent("message read", {
          senderId: user?._id,
          receiverId: data?.senderId,
          messageId: data?._id,
        });
      }
    });

    socketEventManager.subscribe("message seen", (data) => {
      dispatch(
        markAsRead({
          messageId: data?.messageId,
          friendId:
            data?.senderId === user?._id ? data?.receiverId : data?.senderId,
        })
      );
    });

    socketEventManager.subscribe("chat activity", (data) => {
      const { senderName } = data;

      setActivity(`${senderName} is typing...`);

      if (activityTimer.current) clearTimeout(activityTimer.current);
      activityTimer.current = setTimeout(() => {
        setActivity("");
      }, 3000);
    });

    socketEventManager.subscribe("messages read", (data) => {
      dispatch(markAllAsRead(data));
    });

    isInitialized.current = true;

    return () => {
      socketEventManager.unsubscribe("new message");
      socketEventManager.unsubscribe("message seen");
      socketEventManager.unsubscribe("chat activity");
      socketEventManager.unsubscribe("messages read");

      isInitialized.current = false;
    };
  }, [dispatch, user?._id]);


  const chatState = {
    selectedChat,
    setSelectedChat,
    activity,
    setActivity,
    scrollToBottom,
    setScrollToBottom,
  };

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};

export { ChatContext };

export default ChatProvider;
