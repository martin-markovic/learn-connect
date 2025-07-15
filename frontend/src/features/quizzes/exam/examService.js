import axiosInstance from "../../../utils/axiosInstance.js";
import { handleServiceError } from "../../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/exam";

const createExam = async (quizId, token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated,no token");
    }

    const response = await axiosInstance.post(API_URL + "/", quizId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "create exam" },
    });

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
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
      metadata: { clientMessage: "get exam" },
    };

    const response = await axiosInstance.get(API_URL + "/", config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
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
      metadata: { clientMessage: "get exam feedback" },
    };

    const response = await axiosInstance.get(
      `${API_URL}/feedback/${quizId}`,
      config
    );

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getExamScores = async (userId, token) => {
  try {
    if (!token) {
      throw new Error("User is not authenticated, no token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get exam scores" },
    };

    const response = await axiosInstance.get(
      `${API_URL}/scores/${userId}`,
      config
    );

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const examService = {
  createExam,
  getExam,
  getExamFeedback,
  getExamScores,
};

export default examService;
