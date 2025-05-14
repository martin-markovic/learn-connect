import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  chat: {},
  online: false,
};

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await chatService.getMessages(classroomId, token);

export const getChatStatus = createAsyncThunk(
  "chat/getChatStatus",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await chatService.getChatStatus(token);

      return response.data;
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

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat: (state) => initialState,
    addMessage: (state, action) => {
      const { friendId, data } = action.payload;

      if (!state.chat[friendId]) {
        state.chat[friendId] = [];
      }

      state.chat[friendId].push(data);
    },
    markAsRead: (state, action) => {
      const { messageId, friendId } = action.payload;

      state.chat[friendId] = state.chat[friendId].map((message) =>
        message._id === messageId ? { ...message, isRead: true } : message
      );
    },
    markAllAsRead: (state, action) => {
      state.chat[action.payload.friendId] = state.chat[
        action.payload.friendId
      ].map((message) =>
        message.isRead !== true ? { ...message, isRead: true } : message
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.errorMessage = "";
        action.payload.forEach(({ friendId, messages }) => {
          if (friendId) {
            state.chat[friendId] = messages;
          }
        });
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to fetch user messages";
      })
      .addCase(getChatStatus.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getChatStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.online = action.payload?.online;
      })
      .addCase(getChatStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to fetch chat status";
      });
  },
});

export const {
  resetChat,
  addMessage,
  markAsRead,
  markAllAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;
