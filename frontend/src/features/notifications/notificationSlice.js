import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "./notificationService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  userNotifications: [],
};

export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (_, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        throw new Error("User not found");
      }

      const token = user?.token;

      if (!token) {
        throw new Error("Token not found");
      }

      const userId = user?._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await notificationService.getNotifications(
        userId,
        token
      );

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error, thunkAPI);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotifications: (state) => initialState,
    addNewNotification: (state, action) => {
      state.userNotifications.push(action.payload.savedNotification);
    },
    markNotificationAsRead: (state, action) => {
      state.userNotifications = state.userNotifications.filter(
        (notification) => notification?._id !== action.payload
      );
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
        const existingIds = new Set(state.userNotifications.map((n) => n._id));

        action.payload.forEach((item) => {
          if (!existingIds.has(item._id)) {
            state.userNotifications.push(item);
          }
        });
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload.message ||
          action.payload ||
          "Failed to create a new notification";
      });
  },
});

export const {
  resetNotifications,
  addNewNotification,
  markNotificationAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
