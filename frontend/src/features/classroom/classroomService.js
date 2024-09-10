import axios from "axios";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/classroom/";

const joinClassroom = async (classroomId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}join/${classroomId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
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
    const response = await axios.post(
      `${API_URL}leave/${classroomId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getAllClassrooms = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getUserClassrooms = async (token) => {
  try {
    const response = await axios.get(`${API_URL}me`, {
      headers: { Authorization: `Bearer ${token}` },
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
  getAllClassrooms,
  getUserClassrooms,
};

export default classroomService;
