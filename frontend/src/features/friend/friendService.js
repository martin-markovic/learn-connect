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

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const handleFriendRequest = async (clientData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { friendReqResponse, userId } = clientData;

    const response = await axios.post(
      `${API_URL}requests/${userId}`,
      { friendReqResponse },
      config
    );

    return response.data;
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
    };

    const response = await axios.get(API_URL, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const removeFriend = async (friendId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(API_URL, config);

    return response.data;
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
