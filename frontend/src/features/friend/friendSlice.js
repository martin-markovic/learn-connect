import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import friendService from "./friendService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  friendList: [],
  userList: [],
};

export const getFriendList = createAsyncThunk(
  "friends/getFriendList",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await friendService.getFriendList(token);

      return response;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const getUserList = createAsyncThunk(
  "friends/getUserList",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await friendService.getUserList(token);

      return response;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    resetUserList: (state) => initialState,
    sendFriendRequest: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.errorMessage = "";
      state.friendList.push(action.payload);
    },
    handleAccept: (state, action) => {
      const matchingIndex = state.friendList.findIndex(
        (item) => item._id === action.payload._id
      );

      if (matchingIndex !== -1) {
        state.friendList[matchingIndex].status = action.payload.status;
      }
    },
    removeFriend: (state, action) => {
    handleDecline: (state, action) => {
      const { payloadId } = action.payload;

      state.friendList = state.friendList.filter(
        (item) => item._id !== payloadId
      );
    },
      state.friendList = state.friendList.filter(
        (friend) => friend._id !== action.payload._id
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriendList.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getFriendList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.friendList = action.payload || [];
      })
      .addCase(getFriendList.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      })
      .addCase(getUserList.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getUserList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userList = action.payload;
      })
      .addCase(getUserList.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      });
  },
});

export const {
  resetUserList,
  sendFriendRequest,
  removeFriend,
  handleAccept,
  handleDecline,
} = friendSlice.actions;

export default friendSlice.reducer;
