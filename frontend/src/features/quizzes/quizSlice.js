import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import quizService from "./quizService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  userQuizzes: [],
  classQuizzes: [],
  userScores: {},
  isError: false,
  isLoading: false,
  isSuccess: false,
};

export const getUserQuizzes = createAsyncThunk(
  "quizzes/getUser",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await quizService.getUserQuizzes(token);
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const getClassQuizzes = createAsyncThunk(
  "quizzes/getClass",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await quizService.getClassQuizzes(token);
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ id, quizData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      if (!id) {
        throw new Error("ID is required for updating a quiz.");
      }

      const response = await quizService.updateQuiz(id, quizData, token);
      return { id, ...response };
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  "quizzes/delete",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      if (!id) {
        throw new Error("ID is required for deleting a quiz.");
      }

      await quizService.deleteQuiz(id, token);
      return id;
    } catch (error) {
      handleSliceError(error, thunkAPI);
    }
  }
);

export const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    resetQuizzes: (state) => initialState,
    addNewQuiz: (state, action) => {
      state.classQuizzes.push(action.payload);
      state.userQuizzes.push(action.payload);
    },
    addQuizScore: (state, action) => {
      const { quizId, quizScore } = action.payload;

      if (state.userScores[quizId] < quizScore) {
        state.userScores[quizId] = quizScore;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userQuizzes = action.payload;
      })
      .addCase(getUserQuizzes.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(getClassQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getClassQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.classQuizzes = action.payload;
      })
      .addCase(getClassQuizzes.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userQuizzes = state.userQuizzes.map((quiz) =>
          quiz._id === action.payload.id ? action.payload : quiz
        );
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userQuizzes = state.userQuizzes.filter(
          (quiz) => quiz._id !== action.payload
        );
        state.classQuizzes = state.classQuizzes.filter(
          (quiz) => quiz._id !== action.payload
        );
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      });
  },
});

export const { resetQuizzes, addNewQuiz, addQuizScore } = quizSlice.actions;
export default quizSlice.reducer;
