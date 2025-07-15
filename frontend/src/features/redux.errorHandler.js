import { isRejectedWithValue } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const handleServiceError = (error) => {
  if (error.response) {
    console.error("Server Error:", error.response.data);
  } else if (error.request) {
    console.error("No response received:", error.request);
  } else {
    console.error("Error setting up request:", error.message);
  }
};

export const handleSliceError = (error, thunkAPI) => {
  return thunkAPI.rejectWithValue({
    message:
      error.response?.data?.message || error.message || "Unexpected error",
    clientMessage: error.clientMessage,
    isUnauthorized: error.isUnauthorized,
  });
};

export const errorMiddleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload;

    const serverMessage =
      typeof error === "string" ? error : error?.message || "Unexpected error";

    const clientMessage = error?.clientMessage;

    const fullMessage = clientMessage
      ? `Unable to ${clientMessage}: ${serverMessage}`
      : serverMessage;

    toast.error(fullMessage);

    if (error?.isUnauthorized) {
      localStorage.removeItem("user");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }

  return next(action);
};
