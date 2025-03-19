import axios from "axios";
import { handleServiceError } from "../../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/exam";

const createExam = async (quizId, token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated,no token");
    }

    const response = await axios.post(API_URL + "/", quizId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

const getExam = async (token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated, no token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL + "/", config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

const getExamFeedback = async (quizId, token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated, no token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/feedback/${quizId}`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

const finishExam = async (quizId, token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated, no token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/`, { quizId }, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

const examService = {
  createExam,
  getExam,
  getExamFeedback,
  finishExam,
};

export default examService;
