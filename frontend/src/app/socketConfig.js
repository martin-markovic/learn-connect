import io from "socket.io-client";

let socket = null;
let activityTimer = null;

const initializeSocket = async () => {
  socket = io("ws://localhost:8000");

  socket.on("chat message", ({ senderName, message }) => {
    console.log("Received chat message from socket: ", { senderName, message });

    // remove
    dispatch(addMessage({ friend: senderName, message }));
    dispatch(setActivity(""));
  });

  socket.on("chat activity", (name) => {
    console.log("Received chat activity from socket: ", name);
    dispatch(setActivity(`${name} is typing...`));
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
      dispatch(setActivity(""));
    }, 3000);
  });

  return { initialMessages, unsubscribe };
};

const notifyTypingActivity = (selectedFriend, userName) => {
  if (selectedFriend) {
    socket.emit("chat activity", {
      receiverId: selectedFriend,
      senderName: userName,
    });
  }
};

const socketAPI = {
  initializeSocket,
  notifyTypingActivity,
};

export default socketAPI;
