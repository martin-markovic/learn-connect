import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../features/socket/socketContext.js";
import { useSelector, useDispatch } from "react-redux";
import emitRoomEvent from "../../features/socket/controller/roomHandlers.js";
import {
  sendMessage,
  getMessages,
  removeMessages,
} from "../../features/chat/chatSlice.js";

const ChatDisplay = () => {
  const [input, setInput] = useState("");
  const { socketInstance, selectedChat } = useSocketContext();
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { userClassrooms } = useSelector((state) => state.classroom);
  const messages = useSelector((state) => state.chat.messages);
  const classroomId = userClassrooms.find(
    (classroom) => classroom.name === selectedChat
  )?._id;

  useEffect(() => {
    if (classroomId) {
      dispatch(getMessages(classroomId));
    }
  }, [selectedChat, dispatch, userClassrooms]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("chat activity", (data) => {
        const { senderName } = data;

        setActivity(`${senderName} is typing...`);

        if (activityTimer.current) clearTimeout(activityTimer.current);
        activityTimer.current = setTimeout(() => {
          setActivity("");
        }, 3000);
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("chat activity");
      }
    };
  }, [socketInstance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

    try {
      if (selectedChat && socketInstance && classroomId) {
        const messageData = {
          sender: user._id,
          text: input,
          classroom: classroomId,
          status: "pending",
        };

        const response = await dispatch(sendMessage(messageData));

        setInput("");
      } else {
        console.error(
          "Please select a chat and provide valid socket instance."
        );
      }
    }
  };

  const handleKeyPress = async () => {
    try {
      if (selectedChat && socketInstance) {
        const roomData = {
          roomNames: selectedChat,
          senderId: user._id,
          senderName: user.name,
        };

        const clientData = {
          socketInstance,
          eventName: "user typing",
          roomData,
        };

        const response = await emitRoomEvent(clientData);

        if (!response.success) {
          throw new Error("Failed to emit typing event");
        }
      } else {
        console.error(
          "Please select a chat and provide valid socket instance."
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleRemove = async () => {
    if (selectedChat) {
      try {
        const messageIds = messages[classroomId].map((message) => message._id);

        if (messageIds.length === 0 || !messageIds) {
          console.error("Chat history is already empty");
          return;
        }

        const chatData = { classroomId, messageIds };

        const result = await dispatch(removeMessages(chatData));
        if (result.type === "chat/removeMessages/fulfilled") {
          console.log("Messages removed successfully");
        }
      } catch (error) {
        console.error("Error:", error.message);

        // implement toasting  messages (not just error messages)
      }
    }
  };

  return !selectedChat ? (
    <div></div>
  ) : (
    <div className="conversation-display">
      <h3>Chat with {selectedChat}</h3>
      <button onClick={handleRemove}>Delete Conversation</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="message"
          name="message"
          value={input}
          autoComplete="off"
          onKeyDown={handleKeyPress}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Type message..."
        />
        <input type="submit" value="Send" />
      </form>
      <p>{activity}</p>
      <ul>
        {Object.keys(messages).map((classroomId) => (
          <div key={classroomId}>
            {messages[classroomId] && messages[classroomId].length > 0 ? (
              messages[classroomId].map((message) => (
                <div key={message._id}>
                  <strong>{message.sender.name}</strong>: {message.text}
                </div>
              ))
            ) : (
              <div>No messages yet.</div>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ChatDisplay;
