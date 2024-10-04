export const handleSubmit = async (
  socketInstace,
  messageData,
  handleCallback
) => {
  const { token, roomId, messageText } = messageData;

  try {
    const socketData = { socketInstace, token, roomId };

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

export const handleRemoveMessage = async (messageId, handleCallback) => {
  try {
    const response = await handleCallback(messageId);
    return response;
  } catch (error) {
    console.error("Error removing message:", error);
    return {};
  }
};
