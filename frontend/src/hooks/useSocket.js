import { useState, useEffect } from "react";
import io from "socket.io-client";
import socketEventManager from "../features/socket/managers/socket.eventManager.js";

const useSocket = (token) => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!token) {
      console.error("User not authorized, no token.");
      return;
    }

    // implement conditional API url based on process.env.mode
    const socket = io("http://localhost:8000", {
      reconnection: true,
      withCredentials: true,
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      setSocketInstance(socket);
      socketEventManager.setSocketInstance(socket);
    });

    socket.on("disconnect", () => {
      setSocketInstance(null);
      socketEventManager.setSocketInstance(null);
    });

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.close();
      }
      setSocketInstance(null);
      socketEventManager.setSocketInstance(null);
    };
  }, [token]);

  return socketInstance;
};

export default useSocket;
