import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  messages: {},
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
      const classroom = action.payload.classroom;
      if (!state.messages[classroom]) {
        state.messages[classroom] = [];
      }

      state.messages[classroom].push(action.payload);
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

        const messages = action.payload;
        if (messages.length > 0) {
          const classroomId = messages[0].classroom;

          state.messages[classroomId] = messages;
        }
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload || "Failed to get classroom messages";
      })
      .addCase(removeMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(removeMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        const classroom = action.payload;

        state.messages[classroom] = [];
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
