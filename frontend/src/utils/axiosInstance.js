import axios from "axios";

const CLIENT_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: CLIENT_URL || `http://127.0.0.1:3000`,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      error.isUnauthorized = true;
    }

    if (error.config?.metadata?.clientMessage) {
      error.clientMessage = error.config.metadata.clientMessage;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
