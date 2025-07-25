import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/notifications/";

const getNotifications = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get notifications" },
    };

    const response = await axiosInstance.get(`${API_URL}/${userId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const notificationService = {
  getNotifications,
};
export default notificationService;
