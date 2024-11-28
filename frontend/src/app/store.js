import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import quizReducer from "../features/quizzes/quizSlice.js";
import chatReducer from "../features/chat/chatSlice.js";
import classroomReducer from "../features/classroom/classroomSlice.js";
import notificationReducer from "../features/notifications/notificationSlice.js";
import friendReducer from "../features/friend/friendSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
    chat: chatReducer,
    classroom: classroomReducer,
    notifications: notificationReducer,
    friends: friendReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
