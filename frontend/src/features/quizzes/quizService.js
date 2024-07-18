import axios from "axios";

const API_URL = "http://127.0.0.1/api/quizzes/";

const createQuiz = async (quizData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, quizData, config);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getQuizzes = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getQuizById = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL + id, config);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const editQuiz = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL + id, config);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const updateQuiz = async (id, quizData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(API_URL + id, quizData, config);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const deleteQuiz = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(API_URL + id, config);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const quizService = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};

export default quizService;
