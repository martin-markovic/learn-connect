import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/users";

const registerUser = async (userData) => {
  try {
    const { email, password } = userData;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const response = await axios.post(API_URL, userData, {});

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error;
  }
};

const loginUser = async (userData) => {
  try {
    const response = await axios.post(API_URL + "/login", userData);

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("Error logging user in: ", error.message);
  }
};

const updateUser = async (userData, token) => {
  try {
    if (!token) {
      throw new Error("Invalid token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(`${API_URL}/`, userData, config);

    if (!response.data) {
      throw new Error("No response data received");
    }

    const updatedUser = { ...response.data, token };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  } catch (error) {
    console.error(error.message);
  }
};

const authService = {
  registerUser,
  loginUser,
  updateUser,
};

export default authService;
