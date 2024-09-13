import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import displayAPI from "../socket/displayHandlers.js";
import { handleConnect, handleDisconnect } from "../socket/configHandlers.js";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const { token } = useSelector((state) => state.auth.user);

  useEffect(() => {
    handleConnect(token, setSocketInstance);

    return () => {
      if (socketInstance) {
        handleDisconnect(socketInstance);
      }
    };
  }, [token]);

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
