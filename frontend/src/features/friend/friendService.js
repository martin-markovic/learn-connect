import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/friends/";

const getFriendList = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axiosInstance.get(
      `${API_URL}profile/${userId}`,
      config
    );

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getUserList = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axiosInstance.get(`${API_URL}${userId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const friendService = {
  getFriendList,
  getUserList,
};

export default friendService;
