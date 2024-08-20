import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const useSocket = (url, token) => {
  const [socket, setSocket] = useState(null);
  const activityTimer = useRef(null);

  useEffect(() => {
    const socketInstance = io(url, {
      reconnection: false,
      withCredentials: true,
      auth: { token },
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection Error:", err.message);
    });

    socketInstance.on("error", (err) => {
      console.log("Caught flash policy server socket error:", err.stack);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [url, token]);

  return { socket, activityTimer };
};

export default useSocket;
