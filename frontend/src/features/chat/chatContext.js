import { createContext, useContext, useEffect, useState } from "react";
import displayAPI from "../socket/displayHandlers.js";
import configAPI from "../socket/configHandlers.js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const activityTimer = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const { token } = useSelector((state) => state.auth.user);

  useEffect(() => {
    const initSocket = async () => {
      if (token) {
        // implement conditional API url based on process.env.mode
        try {
          const socket = await configAPI.handleConnect(
            "http://localhost:8000",
            token
          );

          socket.on("connect", () => {
            setSocketInstance(socket);
          });

          socket.on("connect_error", (err) => {
            console.error("Connection failed:", err.message);
            toast.error(
              "Unable to connect to the server. Please try again later."
            );
          });
        } catch (error) {
          console.error("Socket connection returned null or undefined.");
          toast.error(
            "An unexpected error occurred. Please refresh the page or try again later."
          );
        }
      } else {
        console.error("User not authorized, no token.");
      }
    };

    initSocket();

    return () => {
      if (socketInstance) {
        configAPI.handleDisconnect(socketInstance);
      }
    };
  }, [token]);

  const contextValue = {
    socketInstance,
    ...displayAPI,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
