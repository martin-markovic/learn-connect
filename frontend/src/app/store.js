import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import quizReducer from "../features/quizzes/quizSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
