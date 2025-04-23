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
    newFriendRequest: (state, action) => {
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
    handleDecline: (state, action) => {
      state.friendList = state.friendList.filter(
        (item) => item._id !== action.payload._id
      );
    },
    handleRemove: (state, action) => {
      state.friendList = state.friendList.filter(
        (item) => item._id !== action.payload._id
      );
    },
    handleBlock: (state, action) => {
      state.userList = state.userList.filter(
        (item) => item._id !== action.payload._id
      );
      state.friendList = state.friendList.filter(
        (item) => item._id !== action.payload._id
      );
    },
    updateUserList: (state, action) => {
      const index = state.userList.findIndex(
        (u) => u._id === action.payload._id
      );
      if (index !== -1) {
        state.userList[index] = action.payload;
      }
    },
    updateFriendList: (state, action) => {
      const index = state.friendList.findIndex(
        (u) => u._id === action.payload._id
      );
      if (index !== -1) {
        state.friendList[index] = action.payload;
      }
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

        if (action.payload.length) {
          action.payload.forEach((item) => {
            const alreadyExists = state.friendList.some(
              (friend) => friend?._id === item?._id
            );

            if (!alreadyExists) {
              action.payload.forEach((item) => {
                state.friendList.push({
                  _id: item?._id,
                  senderId: item?.sender?._id,
                  senderName: item?.sender?.name,
                  senderAvatar: item?.sender?.avatar,
                  receiverId: item?.receiver?._id,
                  receiverName: item?.receiver?.name,
                  receiverAvatar: item?.receiver?.avatar,
                  status: item?.status,
                });
              });
            }
          });
        }
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
        if (action.payload.length) {
          action.payload.forEach((item) => {
            const alreadyExists = state.userList.some(
              (user) => user?._id === item?._id
            );

            if (!alreadyExists) {
              action.payload.forEach((item) => {
                state.userList.push(item);
              });
            }
          });
        }
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
  newFriendRequest,
  handleAccept,
  handleDecline,
  handleRemove,
  handleBlock,
  updateUserList,
  updateFriendList,
} = friendSlice.actions;

export default friendSlice.reducer;
