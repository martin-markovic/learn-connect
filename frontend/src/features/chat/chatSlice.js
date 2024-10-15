import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";
import { handleSliceError } from "../redux.errorHandler.js";
import findMessageIndex from "../chat.findMessage.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  messages: {},
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.sendMessage(messageData, token);
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

export const updateMessageStatus = createAsyncThunk(
  "chat/updateMessageStatus",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.updateMessageStatus(classroomId, token);
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        const classroom = action.payload.classroom;
        if (!state.messages[classroom]) {
          state.messages[classroom] = [];
        }

        state.messages[classroom].push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to send message";
      })
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
      .addCase(updateMessageStatus.pending, (state, action) => {
        const { messageId } = action.payload._id;
        const { messageIndex, classroom } = findMessageIndex(
          state.messages,
          messageId
        );

        if (messageIndex !== -1 && classroom) {
          state.messages[classroom][messageIndex].status = "pending";
        }
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const { messageId } = action.payload._id;
        const { messageIndex, classroom } = findMessageIndex(
          state.messages,
          messageId
        );

        if (messageIndex !== -1 && classroom) {
          state.messages[classroom][messageIndex].status = "success";
        }
      })
      .addCase(updateMessageStatus.rejected, (state, action) => {
        const { messageId } = action.payload._id;
        const { messageIndex, classroom } = findMessageIndex(
          state.messages,
          messageId
        );

        if (messageIndex !== -1 && classroom) {
          state.messages[classroom][messageIndex].status = "failed";
        }
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

export default chatSlice.reducer;
