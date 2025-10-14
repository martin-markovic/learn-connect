const chatReducers = {
  addMessage: (state, action) => {
    const { friendId, data } = action.payload;

    if (!state.chat[friendId]) {
      state.chat[friendId] = [];
    }

    state.chat[friendId].push(data);
  },
  markAsRead: (state, action) => {
    const { messageId, friendId } = action.payload;

    state.chat[friendId] = state.chat[friendId].map((message) =>
      message._id === messageId
        ? { ...message, isRead: true, updatedAt: new Date().toISOString() }
        : message
    );
  },
  markAllAsRead: (state, action) => {
    const { friendId, receiverId } = action.payload;

    state.chat[friendId] = state.chat[friendId].map((message) => {
      const shouldUpdate =
        receiverId != null
          ? message.receiverId === friendId && !message.isRead
          : message.receiverId !== friendId && !message.isRead;

      return shouldUpdate
        ? { ...message, isRead: true, updatedAt: new Date().toISOString() }
        : message;
    });
  },
  changeChatStatus: (state, action) => {
    state.online = action?.payload;
  },
};

export default chatReducers;
