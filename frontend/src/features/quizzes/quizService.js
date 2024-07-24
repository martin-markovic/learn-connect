import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/quizzes/";

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
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      // No response received from the server
      console.error("No response received:", error.request);
    } else {
      // Error setting up the request
      console.error("Error setting up request:", error.message);
    }
    throw error;
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
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
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
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
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
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No request recevied:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw error;
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
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No request received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
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
    if (error.response) {
      console.error("Server error:", error.response.data);
    } else if (error.request) {
      console.error("No request received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
};

const quizService = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  editQuiz,
  deleteQuiz,
};

export default quizService;
