import axios from "axios";

const CLIENT_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: CLIENT_URL || `http://127.0.0.1:3000`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error("Unauthorized request detected");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
