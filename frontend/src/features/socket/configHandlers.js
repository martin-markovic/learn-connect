import io from "socket.io-client";

export const handleConnect = async (url, token) => {
  try {
    const socket = io(url, {
      reconnection: false,
      withCredentials: true,
      auth: {
        token,
      },
    });

    return socket;
  } catch (error) {
    console.error("Error connecting socket:", error);
    return null;
  }
};

export const handleDisconnect = async (socketInstance) => {
  try {
    if (socketInstance) {
      socketInstance.disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting socket:", error);
  }
};

const configAPI = {
  handleConnect,
  handleDisconnect,
};

export default configAPI;
