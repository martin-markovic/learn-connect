import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  messages: {},
};

export const sendFriendMessage = createAsyncThunk(
  "chat/sendFriendMessage",
  async (messageData, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.sendFriendMessage(messageData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendClassroomMessage = createAsyncThunk(
  "chat/sendClassroomMessage",
  async (messageData, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.sendClassroomMessage(messageData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUserMessages = createAsyncThunk(
  "chat/getUserMessages",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getUserMessages(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getClassroomMessages = createAsyncThunk(
  "chat/getClassroomMessages",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getClassroomMessages(classroomId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendFriendMessage.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(sendFriendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const friend = action.payload.receiver;
        if (!state.messages[friend]) {
          state.messages[friend] = [];
        }
        state.messages[friend].push(action.payload);
        state.errorMessage = "";
      })
      .addCase(sendFriendMessage.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to send message";
      })
      .addCase(sendClassroomMessage.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(sendClassroomMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        const classroomId = action.payload.classroom;
        if (!state.messages[classroomId]) {
          state.messages[classroomId] = [];
        }
        state.messages[classroomId].push(action.payload);
      })
      .addCase(sendClassroomMessage.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to send message";
      })
      .addCase(getUserMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getUserMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        action.payload.forEach((message) => {
          const friend =
            message.sender._id === state.auth.user._id
              ? message.receiver._id
              : message.sender._id;
          if (!state.messages[friend]) {
            state.messages[friend] = [];
          }
          state.messages[friend].push(message);
        });
      })
      .addCase(getUserMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to get user messages";
      })
      .addCase(getClassroomMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getClassroomMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        const classroomId = action.meta.arg;
        if (!state.messages[classroomId]) {
          state.messages[classroomId] = [];
        }
        state.messages[classroomId] = action.payload;
      })
      .addCase(getClassroomMessages.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload || "Failed to get classroom messages";
      });
  },
});

export default chatSlice.reducer;
