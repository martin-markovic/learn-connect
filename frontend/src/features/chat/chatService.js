import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/chat";

const getMessages = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get chat messages" },
    };

    const response = await axiosInstance.get(API_URL, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getChatStatus = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get chat status" },
    };

    const response = await axiosInstance.get(`${API_URL}/status`, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const chatService = {
  getMessages,
  getChatStatus,
};

export default chatService;
