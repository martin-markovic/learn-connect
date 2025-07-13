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
  const message =
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString();

  return thunkAPI.rejectWithValue(message);
};

export const errorMiddleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const errorMessage =
      typeof action.payload === "string"
        ? action.payload
        : action.payload?.message || "Unexpected error";

    console.log("errorMessage: ", errorMessage);

    toast.error(errorMessage);
  }

  return next(action);
};
