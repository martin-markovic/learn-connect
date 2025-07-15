import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/friends/";

const getFriendList = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get friend list" },
    };

    const response = await axiosInstance.get(`${API_URL}${userId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getUserList = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get user list" },
    };

    const response = await axiosInstance.get(API_URL, config);

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
