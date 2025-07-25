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
  examScores: {},
};

export const getExam = createAsyncThunk("exam/get", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;

    const response = await examService.getExam(token);

    return response;
  } catch (error) {
    handleSliceError(error, thunkAPI);
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
      handleSliceError(error, thunkAPI);
    }
  }
);

export const getExamScores = createAsyncThunk(
  "exam/getExamScores",
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await examService.getExamScores(userId, token);

      return response;
    } catch (error) {
      handleSliceError(error, thunkAPI);
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
    finishExam: (state, action) => {
      if (String(state.examData?._id) === String(action.payload?.examId)) {
        state.examData = {};
      }

      state.examFeedback = action.payload?.scorePayload;
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
      .addCase(getExamScores.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getExamScores.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";

        const { friendId, scoreList } = action.payload;

        if (!state.examScores[friendId]) {
          state.examScores[friendId] = scoreList;
        } else {
          const existingIds = new Set(
            state.examScores[action.payload?.friendId].map((score) => score._id)
          );

          scoreList.forEach((item) => {
            if (item?._id && !existingIds.has(item._id)) {
              state.examScores[item?._id].push(item);
            }
          });
        }
      })
      .addCase(getExamScores.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { resetExam, createExam, updateExam, finishExam } =
  examSlice.actions;

export default examSlice.reducer;
