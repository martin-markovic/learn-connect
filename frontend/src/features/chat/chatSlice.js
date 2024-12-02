import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  chat: {},
};

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await chatService.getMessages(classroomId, token);

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

export const removeMessages = createAsyncThunk(
  "chat/removeMessages",
  async (chatData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      return await chatService.removeMessages(chatData, token);
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
      const { chatId, ...messageData } = action.payload;

      if (!state.chat[chatId]) {
        state.chat[chatId] = [];
      }

      state.chat[chatId].push(messageData);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        action.payload.forEach(({ chatId, messages }) => {
          state.chat = { ...state.chat, [chatId]: messages };
        });
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to fetch user messages";
      })
      .addCase(removeMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(removeMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        const chatId = action.payload;

        state.chat[chatId] = [];
      })
      .addCase(removeMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to remove messages";
      });
  },
});

export const { resetChat, addMessage } = chatSlice.actions;

export default chatSlice.reducer;
