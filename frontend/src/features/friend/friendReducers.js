const friendReducers = {
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
    const index = state.userList.findIndex((u) => u._id === action.payload._id);
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
};

export default friendReducers;
