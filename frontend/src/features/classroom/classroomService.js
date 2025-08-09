import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/classroom/";

const joinClassroom = async (classroomId, token) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}join/${classroomId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },

        metadata: { clientMessage: "join classroom" },
      }
    );

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const leaveClassroom = async (classroomId, token) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}leave/${classroomId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },

        metadata: { clientMessage: "leave classroom" },
      }
    );
    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getClassroomList = async (token) => {
  try {
    const response = await axiosInstance.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },

      metadata: { clientMessage: "get classroom list" },
    });

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getUserClassroom = async (token) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },

      metadata: { clientMessage: "get user classroom" },
    });

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const classroomService = {
  joinClassroom,
  leaveClassroom,
  getClassroomList,
  getUserClassroom,
};

export default classroomService;
