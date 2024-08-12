import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  classrooms: [],
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
        (error.response && error.response && error.response.data.message) ||
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
        (error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const joinClassroom = createAsyncThunk(
  "chat/joinClassroom",
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

export const getUserMessages = createAsyncThunk(
  "chat/getUserMessages",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getUserMessages(token);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) ||
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
        (error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getClassrooms = createAsyncThunk(
  "chat/getClassrooms",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await chatService.getClassrooms(token);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const leaveClassroom = createAsyncThunk(
  "chat/leaveClassroom",
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
      .addCase(sendFriendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendFriendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const friend = action.payload.receiver;
        if (!state.messages[friend]) {
          state.messages[friend] = [];
        }
        state.messages[friend].push(action.payload);
      })
      .addCase(sendFriendMessage.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(sendClassroomMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendClassroomMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const classroomId = action.payload.classroom;
        if (!state.messages[classroomId]) {
          state.messages[classroomId] = [];
        }
        state.messages[classroomId].push(action.payload);
      })
      .addCase(sendClassroomMessage.rejected, (state) => {
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
      .addCase(getUserMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
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
      .addCase(getUserMessages.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(getClassroomMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClassroomMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const classroomId = action.meta.arg;
        if (!state.messages[classroomId]) {
          state.messages[classroomId] = [];
        }
        state.messages[classroomId] = action.payload;
      })
      .addCase(getClassroomMessages.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(getClassrooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClassrooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.classrooms = action.payload;
      })
      .addCase(getClassrooms.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      })
      .addCase(leaveClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.classrooms = state.classrooms.filter(
          (classroom) => classroom._id !== action.payload._id
        );
      })
      .addCase(leaveClassroom.rejected, (state) => {
        state.isSuccess = false;
        state.isError = true;
      });
  },
});

export default chatSlice.reducer;
