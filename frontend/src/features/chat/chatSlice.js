import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";
import { handleSliceError } from "../redux.errorHandler.js";
import chatReducers from "./chatReducers.js";

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
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await chatService.getMessages(token);

      return response.data;
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const getChatStatus = createAsyncThunk(
  "chat/getChatStatus",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await chatService.getChatStatus(token);

      return response.data;
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChat: (state) => initialState,
    ...chatReducers,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = "";
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.errorMessage = "";
        if (action?.payload?.length) {
          action?.payload?.forEach(({ friendId, messages }) => {
            if (friendId) {
              state.chat[friendId] = messages;
            }
          });
        }

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
  changeChatStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
