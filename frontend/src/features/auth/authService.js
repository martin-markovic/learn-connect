import axiosInstance from "../../utils/axiosInstance.js";

const API_URL = "http://127.0.0.1:8000/api/users";

const registerUser = async (userData) => {
  try {
    const { email, password, avatar } = userData;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    let multiPartData;

    if (avatar) {
      const formData = new FormData();
      formData.append("avatar", avatar);
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== "avatar") formData.append(key, value);
      });

      multiPartData = formData;
    }

    const response = await axiosInstance.post(
      API_URL,
      avatar ? multiPartData : userData,
      {
        metadata: { clientMessage: "register user" },
      }
    );

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
    const response = await axiosInstance.post(API_URL + "/login", userData, {
      metadata: { clientMessage: "login user" },
    });

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error("Error logging user in: ", error.message);
    throw error;
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
      metadata: { clientMessage: "update user info" },
    };

    let multiPartData;

    if (userData.avatar instanceof File) {
      const formData = new FormData();
      formData.append("avatar", userData.avatar);
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== "avatar") formData.append(key, value);
      });

      multiPartData = formData;
    }

    const response = await axiosInstance.put(
      `${API_URL}/`,
      userData.avatar && userData.avatar !== "removeAvatar"
        ? multiPartData
        : userData,
      config
    );

    if (!response.data) {
      throw new Error("No response data received");
    }
    const updatedUser = { ...response.data, token };

    if (!updatedUser || !updatedUser._id) {
      throw new Error("Invalid user data received from server");
    }

    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error("Error updating user: ", error.message);
    throw error;
  }
};

const authService = {
  registerUser,
  loginUser,
  updateUser,
};

export default authService;
