import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import classroomService from "./classroomService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  allClassrooms: [],
  userClassrooms: [],
};

export const joinClassroom = createAsyncThunk(
  "classroom/joinClassroom",
  async (classroomId, thunkAPI) => {
    try {
      if (!classroomId) {
        throw new Error("Classroom ID is required");
      }

      const { token } = thunkAPI.getState().auth.user;

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await classroomService.joinClassroom(classroomId, token);
      return response;
    } catch (error) {
      handleSliceError(error);
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

      const response = await classroomService.leaveClassroom(
        classroomId,
        token
      );
      return { classroomId, name: response.name };
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const getAllClassrooms = createAsyncThunk(
  "classroom/getAll",
  async (_, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await classroomService.getAllClassrooms(token);

      return data;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const getUserClassrooms = createAsyncThunk(
  "classroom/getMe",
  async (_, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await classroomService.getUserClassrooms(token);

      return data;
    } catch (error) {
      handleSliceError(error);
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
        state.errorMessage = "";
        state.userClassrooms.push(action.payload.classroom);
      })
      .addCase(joinClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to join classroom";
      })
      .addCase(getAllClassrooms.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getAllClassrooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.allClassrooms = action.payload;
      })
      .addCase(getAllClassrooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      })
      .addCase(getUserClassrooms.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getUserClassrooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userClassrooms = action.payload;
      })
      .addCase(getUserClassrooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      })
      .addCase(leaveClassroom.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(leaveClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userClassrooms = state.userClassrooms.filter(
          (classroom) => classroom._id !== action.payload.classroomId
        );
      })
      .addCase(leaveClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = state.errorMessage =
          action.payload?.message ||
          action.error.message ||
          "Failed to leave classroom";
      });
  },
});

export default classroomSlice.reducer;
