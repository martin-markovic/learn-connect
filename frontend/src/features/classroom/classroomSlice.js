import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import classroomService from "./classroomService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  classroomList: [],
  userClassroom: null,
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
      handleSliceError(error, thunkAPI);
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
      handleSliceError(error, thunkAPI);
    }
  }
);

export const getClassroomList = createAsyncThunk(
  "classroom/getClassroomList",
  async (_, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await classroomService.getClassroomList(token);

      return data;
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const getUserClassroom = createAsyncThunk(
  "classroom/getUserClassroom",
  async (_, thunkAPI) => {
    try {
      const { token } = thunkAPI.getState().auth.user;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await classroomService.getUserClassroom(token);

      return data;
    } catch (error) {
      handleSliceError(error, thunkAPI);
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
        state.userClassroom = action.payload?.updatedClassroom;
      })
      .addCase(joinClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to join classroom";
      })
      .addCase(getClassroomList.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getClassroomList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.classroomList = action.payload;
      })
      .addCase(getClassroomList.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      })
      .addCase(getUserClassroom.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getUserClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userClassroom = action.payload;
      })
      .addCase(getUserClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to get user classroom";
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
        state.classroomList = state.classroomList.filter(
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

export const { resetClassroom } = classroomSlice.actions;

export default classroomSlice.reducer;
