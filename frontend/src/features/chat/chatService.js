import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/chat";

const getMessages = async (_, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);

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
    };

    const response = await axios.get(`${API_URL}/status`, config);

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
