import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleSliceError } from "../../redux.errorHandler.js";
import examService from "./examService.js";

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMessage: "",
  examData: {},
  answers: [],
};

export const createExam = createAsyncThunk(
  "exam/create",
  async (quizId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await examService.createExam(quizId, token);

      return response.data;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const getExam = createAsyncThunk("exam/get", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;

    const response = await examService.getExam(token);
    return response.data;
  } catch (error) {
    handleSliceError(error);
  }
});

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    resetExam: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createExam.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.examData = action.payload;
      })
      .addCase(createExam.rejected, (state, action) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = action.payload;
      })
      .addCase(getExam.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.examData = action.payload;
      })
      .addCase(getExam.rejected, (state, action) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = action.payload;
      })
  },
});

const { resetExam } = examSlice.actions;
export default examSlice.reducer;
