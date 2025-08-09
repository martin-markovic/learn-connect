import axiosInstance from "../../utils/axiosInstance.js";
import { handleServiceError } from "../redux.errorHandler.js";

const API_URL = "http://127.0.0.1:8000/api/quizzes/";

const getUserQuizzes = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get user quizzes" },
    };

    const response = await axiosInstance.get(API_URL, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const getClassQuizzes = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "get class quizzes" },
    };

    const response = await axiosInstance.get(`${API_URL}classroom`, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const updateQuiz = async (id, quizData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "update quiz" },
    };

    const response = await axiosInstance.put(API_URL + id, quizData, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const deleteQuiz = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: { clientMessage: "delete quiz" },
    };

    const response = await axiosInstance.delete(API_URL + id, config);

    return response.data;
  } catch (error) {
    handleServiceError(error);
    throw error;
  }
};

const quizService = {
  getUserQuizzes,
  getClassQuizzes,
  updateQuiz,
  deleteQuiz,
};

export default quizService;
