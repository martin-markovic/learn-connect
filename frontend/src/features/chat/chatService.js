import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/chat/";

const sendMessage = async (messageData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { classroom } = messageData;

    const response = await axios.post(
      `${API_URL}${classroom}/chat`,
      messageData,
      config
    );

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getMessages = async (classroomId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}${classroomId}/chat`, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
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
    handleServiceError(error);
    throw error;
  }
};

const chatService = {
  sendMessage,
  getMessages,
};

export default chatService;
