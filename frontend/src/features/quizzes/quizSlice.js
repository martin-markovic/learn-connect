import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import quizService from "./quizService.js";

const initialState = {
  userQuizzes: [],
  classQuizzes: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
};

export const createQuiz = createAsyncThunk(
  "quizzes/create",
  async (quizData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await quizService.createQuiz(quizData, token);
    } catch (error) {
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUserQuizzes = createAsyncThunk(
  "quizzes/getUser",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await quizService.getUserQuizzes(token);
    } catch (error) {
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
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
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
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
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
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
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const quizSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    resetQuizzes: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userQuizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(getUserQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = action.payload;
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
        state.quizzes = action.payload;
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
        state.quizzes = state.quizzes.map((quiz) =>
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
        state.quizzes = state.quizzes.filter(
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

export const { resetQuizzes } = quizSlice.actions;
export default quizSlice.reducer;
