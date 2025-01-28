import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleSliceError } from "../../redux.errorHandler.js";
import examService from "./examService.js";

const initialState = {
  isLoading: true,
  isError: false,
  isSuccess: false,
  errorMessage: "",
  examData: {},
  quizFeedback: {},
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

export const finishExam = createAsyncThunk(
  "exam/finish",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await examService.finishExam(token);
      return response.data;
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
      const { questionIndex, answer } = action.payload;

      state.answers[questionIndex] = answer;
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
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = action.payload;
      })
      .addCase(finishExam.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(finishExam.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.examData = {};
      })
      .addCase(finishExam.rejected, (state, action) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = action.payload;
      });
  },
});


export const { resetExam, createExam, updateExam } = examSlice.actions;

export default examSlice.reducer;
