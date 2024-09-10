import configAPI from "./configHandlers.js";
import { sendMessage, updateMessageStatus } from "../chat/chatSlice.js";
import { toast } from "react-toastify";

export const initSocket = async (token, setupCallback) => {
  if (!token) {
    console.error("User not authorized, no token.");
    return null;
  }

  try {
    // implement conditional API url based on process.env.mode
    const socket = await configAPI.handleConnect(
      "http://localhost:8000",
      token
    );

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

export const handleSocketEvents = (socketInstance, dispatch) => {
  if (!socketInstance) {
    console.error("Socket instance is null, cannot set up event handlers.");
    return;
  }

  socketInstance.on("newMessage", (message) => {
    console.log("New message received:", message);

    dispatch(sendMessage(message));
  });

  socketInstance.on("chatOpen", (chatId) => {
    console.log("Chat messages marked as read: ", chatId);

    dispatch(updateMessageStatus(chatId));
  });
};
