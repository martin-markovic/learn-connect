import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "./notificationService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  userNotifications: [],
  newNotifications: false,
};

export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (_, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        throw new Error("User not found");
      }

      const token = user.token;

      if (!token) {
        throw new Error("Token not found");
      }

      const userId = user?._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      return await notificationService.getNotifications(userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      handleSliceError(error, thunkAPI);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        throw new Error("User not found");
      }

      const token = user.token;

      if (!token) {
        throw new Error("Token not found");
      }

      const notificationData = {
        notificationId,
        userId: user?._id,
      };

      return await notificationService.markAsRead(notificationData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      handleSliceError(error, thunkAPI);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (notificationId, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await notificationService.markAllAsRead(notificationId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      handleSliceError(error, thunkAPI);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotifications: (state) => initialState,
    setNewNotifications: (state) => {
      state.newNotifications = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userNotifications = action.payload;
        state.newNotifications = false;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload || "Failed to create a new notification";
      })
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userNotifications = state.userNotifications.filter(
          (notification) => notification._id !== action.payload
        );
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload || "Failed to  mark notification as read";
      })
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userNotifications = [];
        state.newNotifications = false;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload || "Failed to mark all notifications as read";
      });
  },
});

export const { resetNotifications, setNewNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
