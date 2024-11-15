import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import friendService from "./friendService.js";
import { handleSliceError } from "../redux.errorHandler.js";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: "",
  friendList: {},
  userList: [],
};

export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (userName, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await friendService.handleFriendRequest(userName, token);

      return data;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const getFriendList = createAsyncThunk(
  "friends/getFriendList",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;

      if (!token) {
        throw new Error("Token not found");
      }

      const response = await friendService.getFriendList(token);

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

      const data = await friendService.getUserList(token);

      return data;
    } catch (error) {
      handleSliceError(error);
    }
  }
);

export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      if (!token) {
        throw new Error("Token not found");
      }

      const data = await friendService.removeFriend(token);

      return data;
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
    handleFriendRequest: (state, action) => {
      const { receiver, requestStatus } = action.payload;

      if (requestStatus === "accepted") {
        state.userList[receiver].friendshipStatus = requestStatus;
        state.friendList.push(receiver);
      } else {
        state.userList[receiver].friendshipStatus = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendFriendRequest.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.errorMessage = "";
        state.userList = state.userList[action.payload].friendshipStatus =
          "requested";
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to submit a friend request";
      })
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
        state.friendList = action.payload;
      })
      .addCase(getFriendList.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.errorMessage =
          action.payload?.message || "Failed to load classrooms";
      });
  },
});

export const { resetUserList, handleFriendRequest } = friendSlice.reducer;

export default friendSlice.reducer;
