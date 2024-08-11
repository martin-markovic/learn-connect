import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";

const initialState = {
  isSuccess,
  isLoading,
  isError,
  classrooms: [],
  messages: {},
};

export const sendMessage = createAsyncThunk(
  "chat/send",
  async (messageData, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.sendMessage(messageData, token);
    } catch (error) {
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const joinClassroom = createAsyncThunk(
  "chat/joinClass",
  async (classroomId, thunkAPI) => {
    try {
      const token = JSON.parse(localStorage.getItem("user")).token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.joinClassroom(classroomId, token);
    } catch (error) {
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMessages = createAsyncThunk("chat/get", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    return await chatService.getMessages(token);
  } catch (error) {
    const message =
      (error.response && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

const getUserClassrooms = createAsyncThunk(
  "chat/getClasses",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getUserClassrooms(token);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const leaveClassroom = createAsyncThunk(
  "chat/leaveClass",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await chatService.leaveClassroom(classroomId, token);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) ||
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
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages[friend].push(action.payload);
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(joinClassroom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(joinClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.classrooms = action.payload;
      })
      .addCase(joinClassroom.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(getMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(getUserClassrooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserClassrooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = action.payload;
      })
      .addCase(getUserClassrooms.fulfilled, (state) => {
        state.isSuccess = false;
        state.isError = true;
        state.classrooms = state.classrooms.filter(
          (classroom) => classroom.id !== action.payload.id
        );
      })
      .addCase(leaveClassroom.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      });
  },
});

export default chatSlice.reducer;
