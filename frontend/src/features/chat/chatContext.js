import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import displayAPI from "../socket/displayHandlers.js";
import configAPI from "../socket/configHandlers.js";
import { initSocket, handleSocketEvents } from "../socket/socketManager.js";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const { token } = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  useEffect(() => {
    initSocket(token, setSocketInstance);

    return () => {
      if (socketInstance) {
        configAPI.handleDisconnect(socketInstance);
      }
    };
  }, [token]);

  useEffect(() => {
    if (socketInstance) {
      handleSocketEvents(socketInstance, dispatch);
    }
  }, [socketInstance, dispatch]);

  const contextValue = {
    socketInstance,
    selectedChat,
    setSelectedChat,
    ...displayAPI,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
