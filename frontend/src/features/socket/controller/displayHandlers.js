import { validateClientData } from "../clientMiddleware.js";

const handleSubmit = async (socketInstace, messageData, handleCallback) => {
  const { token, roomId, messageText } = messageData;

  try {
    const socketData = { socketInstace, token, roomId };

    if (!validateClientData(socketData)) {
      throw new Error("Invalid socket data");
    }

    if (!roomId) {
      throw new Error("Please add message recipient");
    }

    if (!messageText) {
      throw new Error("Please add message text");
    }

    const response = await handleCallback(messageData);
    socketInstace.emit("sendMessage", messageText);
    return response;
  } catch (error) {
    console.error(error.message);
    return {};
  }
};

const handleChatOpen = async (messageData, handleCallback) => {
  try {
    const response = await handleCallback(messageData);
    return response;
  } catch (error) {
    console.error("Error opening message:", error);
    return {};
  }
};

const handleChatInit = async (fetchCallback, token) => {
  try {
    const response = await fetchCallback(token);
    return response;
  } catch (error) {
    console.error("Error fetching initial messages:", error);
    return {};
  }
};

const handleRemoveMessage = async (messageId, handleCallback) => {
  try {
    const response = await handleCallback(messageId);
    return response;
  } catch (error) {
    console.error("Error removing message:", error);
    return {};
  }
};

const handleUnsendMessage = async (messageId, handleCallback) => {
  try {
    const response = await handleCallback(messageId);
    return response;
  } catch (error) {
    console.error("Error unsending message:", error);
    return {};
  }
};

const displayAPI = {
  handleSubmit,
  handleChatOpen,
  handleChatInit,
  handleRemoveMessage,
  handleUnsendMessage,
};

export default displayAPI;
