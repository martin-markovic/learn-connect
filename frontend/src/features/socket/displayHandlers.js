const handleSubmit = async (socketInstace, messageData, handleCallback) => {
  try {
    if (socketInstace) {
      const { senderId, recipientId, messageText } = messageData;

      if (!senderId) {
        throw new Error("User not authorized");
      }

      if (!recipientId) {
        throw new Error("Please add message recipient");
      }

      if (!messageText) {
        throw new Error("Please add message text");
      }

      const response = await handleCallback(messageData);
      socketInstace.emit("sendMessage", messageText);
      return response;
    } else {
      return console.error("Socket is not defined");
    }
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
