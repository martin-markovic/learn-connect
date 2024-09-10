import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/chat/";

const sendFriendMessage = async (messageData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, messageData, config);
    return response.data;
  } catch (error) {
    handleError(error);
    handleServiceError(error);
    throw error;
  }
};

const getUserMessages = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    handleError(error);
    handleServiceError(error);
    throw error;
  }
};

const getClassroomMessages = async (classroomId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_URL}/classroom/${classroomId}/messages`,
      config
    );
    return response.data;
  } catch (error) {
    handleError(error);
    handleServiceError(error);
    throw error;
  }
};

const chatService = {
  sendFriendMessage,
  getUserMessages,
  getClassroomMessages,
};

export default chatService;
