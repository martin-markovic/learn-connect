import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/notifications/";

const getNotifications = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/${userId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const markAllAsRead = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.patch(`${API_URL}/${userId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markAllAsRead,
};
export default notificationService;
