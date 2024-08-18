import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import classroomService from "./classroomService.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  classrooms: [],
};

export const joinClassroom = createAsyncThunk(
  "classroom/joinClassroom",
  async (classroomId, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;

      if (!token) {
        throw new Error("Token not found");
      }

      return await classroomService.joinClassroom(classroomId, token);
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

export const leaveClassroom = createAsyncThunk(
  "classroom/leaveClassroom",
  async (classroomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      if (!token) {
        throw new Error("Token not found");
      }

      return await classroomService.leaveClassroom(classroomId, token);
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

export const getClassrooms = createAsyncThunk(
  "classroom/getClassrooms",
  async (_, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await classroomService.getClassrooms(token);

      return data;
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

const classroomSlice = createSlice({
  name: "classroom",
  initialState,
  reducers: {
    resetClassroom: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinClassroom.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(joinClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.classrooms.push(action.payload);
      })
      .addCase(joinClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to join classroom";
      })
      .addCase(getClassrooms.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getClassrooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.classrooms = action.payload;
      })
      .addCase(getClassrooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload.message || "Failed to load classrooms";
      })
      .addCase(leaveClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.errorMessage = "";
        state.classrooms = state.classrooms.filter(
          (classroom) => classroom._id !== action.payload._id
        );
      })
      .addCase(leaveClassroom.rejected, (state, action) => {
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload || "Failed to leave classroom";
      });
  },
});

export default classroomSlice.reducer;
