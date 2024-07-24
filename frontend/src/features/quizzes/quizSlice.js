import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import quizService from "./quizService.js";

const initialState = {
  quizzes: [],
  isError: false,
  isLoading: false,
  isSuccess: false,
  isEditing: false,
  formMessage: { question: "", choices: [], answer: "" },
  errorMessage: "",
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

export const getQuizzes = createAsyncThunk(
  "quizzes/getAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await quizService.getQuizzes(token);
    } catch (error) {
      const message =
        (error.response && error.response && error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const editQuiz = createAsyncThunk("quiz/edit", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;

    return await quizService.editQuiz(id, token);
  } catch (error) {
    const message =
      (error.response && error.response && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const updateQuiz = createAsyncThunk(
  "quizzes/update",
  async ({ id, quizData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      return await quizService.updateQuiz(id, quizData, token);
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
      return await quizService.deleteQuiz(id, token);
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
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(getQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = action.payload;
      })
      .addCase(getQuizzes.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
      })
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = state.quizzes.filter(
          (quiz) => quiz._id !== action.payload.id
        );
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
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
          quiz._id === action.payload._id ? action.payload : quiz
        );
        state.isEditing = false;
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isError = true;
        state.isSuccess = false;
        state.errorMessage = action.payload;
        state.isEditing = false;
      })
      .addCase(editQuiz.fulfilled, (state, action) => {
        state.isEditing = true;
        state.formMessage = action.payload;
      });
  },
});

export const { resetQuizzes } = quizSlice.actions;
export default quizSlice.reducer;
