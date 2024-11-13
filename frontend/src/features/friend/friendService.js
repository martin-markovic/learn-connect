import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/friends/";

const addFriend = async (friendName, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, { friendName }, config);

    return response;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getFriendList = async (_, token) => {
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

const getUserList = async (_, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}`, config);

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
  addFriend,
  getFriendList,
  getUserList,
  removeFriend,
};

export default friendService;
