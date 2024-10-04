import io from "socket.io-client";
import { toast } from "react-toastify";

// remove toast from this module
export const handleConnect = async (token, setupCallback) => {
  if (!token) {
    console.error("User not authorized, no token.");
    return null;
  }

  try {
    // implement conditional API url based on process.env.mode
    const socket = io("http://localhost:8000", {
      reconnection: false,
      withCredentials: true,
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      setupCallback(socket);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection failed:", err.message);
      toast.error("Unable to connect to the server. Please try again later.");
    });

    socket.on("reconnect_attempt", () => {
      console.log("Attempting to reconnect");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return socket;
  } catch (error) {
    console.error("Socket connection returned null or undefined.");
    toast.error(
      "An unexpected error occurred. Please refresh the page or try again later."
    );
  }
};

export const handleDisconnect = async (socketInstance) => {
  try {
    if (socketInstance) {
      await socketInstance.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting socket:", error);
  }
};
