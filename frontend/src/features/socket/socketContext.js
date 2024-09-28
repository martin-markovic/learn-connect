import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  handleConnect,
  handleDisconnect,
} from "./controller/configHandlers.js";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
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
    token,
    selectedChat,
    setSelectedChat,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
