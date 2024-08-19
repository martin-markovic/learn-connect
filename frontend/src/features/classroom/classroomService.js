import axios from "axios";
import handleError from "../service.errorHandler.js";

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
    handleError(error);
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
    handleError(error);
    throw error;
  }
};

const getClassrooms = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const classroomService = {
  joinClassroom,
  getClassrooms,
  leaveClassroom,
};

export default classroomService;
