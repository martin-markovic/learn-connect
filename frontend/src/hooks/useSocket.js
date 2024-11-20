import { useState, useEffect } from "react";
import io from "socket.io-client";

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
      console.log("Client connected to socket");
      setSocketInstance(socket);
    });

    socket.on("initialize", () => {
      console.log("Socket successfully initialized");
    });

    socket.on("reconnection attempt", () => {
      console.log("Attempting to reconnect");
    });

    socket.on("reconnected", () => {
      console.log("Attempting to reconnect");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("reconnection attempt");
      socket.off("reconnected");
      socket.off("disconnect");
      socket.close();
    };
  }, [token]);

  return socketInstance;
};

export default useSocket;
