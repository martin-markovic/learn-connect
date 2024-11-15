import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/friends/";

const sendFriendRequest = async (userId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}${userId}`, {}, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const handleFriendRequest = async (requestId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}${requestId}`, {}, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getFriendList = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}me`, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const removeFriend = async (friendName, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(API_URL, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const friendService = {
  sendFriendRequest,
  handleFriendRequest,
  getFriendList,
  getUserList,
  removeFriend,
};

export default friendService;
