import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/chat/";

const sendFriendMessage = async (messageData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, messageData, config);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const joinClassroom = async (classroomName, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      `${API_URL}classroom/join`,
      { classroomName },
      config
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const getUserMessages = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const getClassrooms = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/classrooms`, config);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const getClassroomMessages = async (classroomId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `${API_URL}/classroom/${classroomId}/messages`,
      config
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const leaveClassroom = async (classroomId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(
      `${API_URL}/classroom/${classroomId}/leave`,
      config
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const handleError = (error) => {
  if (error.response) {
    console.error("Server Error:", error.response.data);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error setting up request:", error.message);
  }
};

const chatService = {
  sendFriendMessage,
  joinClassroom,
  getUserMessages,
  getClassroomMessages,
  getClassrooms,
  leaveClassroom,
};

export default chatService;
