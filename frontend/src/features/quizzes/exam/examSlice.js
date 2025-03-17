import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleSliceError } from "../../redux.errorHandler.js";
import examService from "./examService.js";

const initialState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMessage: "",
  examData: {},
  quizFeedback: {},
  examFeedback: {},
};

export const getExam = createAsyncThunk("exam/get", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;

    const response = await examService.getExam(token);

    return response;
  } catch (error) {
    handleSliceError(error);
  }
});

export const getExamFeedback = createAsyncThunk(
  "exam/getFeedback",
  async (quizId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await examService.getExamFeedback(quizId, token);

      return response;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const finishExam = createAsyncThunk(
  "exam/finish",
  async (quizId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await examService.finishExam(quizId, token);

      return response;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    resetExam: (state) => initialState,
    createExam: (state, action) => {
      state.examData = action.payload;
    },
    updateExam: (state, action) => {
      if (state.examData._id === action.payload._id) {
        state.examData.answers = action.payload.answers;
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(getExamFeedback.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getExamFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.quizFeedback = action.payload;
      })
      .addCase(getExamFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(finishExam.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(finishExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isExamFinished = true;
        state.isError = false;
        state.errorMessage = "";
        state.quizFeedback = action.payload?.scorePayload;
        state.examFeedback = action.payload;
        if (state.examData?._id === action.payload?.examId) {
          state.examData = {};
        }
      })
      .addCase(finishExam.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { resetExam, createExam, updateExam } = examSlice.actions;

export default examSlice.reducer;
