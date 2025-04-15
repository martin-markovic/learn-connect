import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/users";

const registerUser = async (userData) => {
  try {
    const { email, password } = userData;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const response = await axios.post(API_URL, userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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

const authService = {
  registerUser,
  loginUser,
};

export default authService;
