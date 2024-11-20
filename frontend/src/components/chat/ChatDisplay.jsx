import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import emitRoomEvent from "../../features/socket/controller/roomHandlers.js";
import {
  addMessage,
  getMessages,
  removeMessages,
} from "../../features/chat/chatSlice.js";

const ChatDisplay = ({ socketInstance, selectedChat }) => {
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);
  const chatEndRef = useRef(null);

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
  }, [dispatch, userClassrooms, classroomId]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("message delivered", (data) => {
        const messageData = data;

        dispatch(addMessage(messageData));

        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      });

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
        socketInstance.off("message delivered");
      }
    };
  }, [socketInstance, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedChat && socketInstance && classroomId) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    try {
      const messageData = {
        sender: { id: user?._id, name: user?.name },
        text: input,
        classroom: classroomId,
        status: "pending",
      };

      const clientData = {
        socketInstance,
        eventName: "message room",
        roomData: messageData,
      };

      const response = await emitRoomEvent(clientData);

      if (response.success) {
        setInput("");

        const notificationData = {
          sender: { id: user?._id, name: user?.name },
          classroom: classroomId,
          eventName: "new message",
        };

        const userData = {
          socketInstance,
          eventName: "new notification",
          roomData: notificationData,
        };

        await emitRoomEvent(userData);
      }
    } catch (error) {
      console.error("Error:", error.message);
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

  const handleRemove = () => {
    if (selectedChat) {
      try {
        const messageIds = messages[classroomId].map((message) => message._id);

        if (messageIds.length === 0 || !messageIds) {
          console.error("Chat history is already empty");
          return;
        }

        const chatData = { classroomId, messageIds };

        const result = dispatch(removeMessages(chatData));
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

      <div className="conversation-display__chat">
        {Object.keys(messages).map((classroomId) => (
          <ul key={classroomId}>
            {messages[classroomId] && messages[classroomId].length > 0 ? (
              messages[classroomId].map((message) => (
                <li key={message._id} style={{ marginRight: "1em" }}>
                  {message.sender.id === user?._id ? null : (
                    <span>
                      <strong>{message.sender.name}</strong>
                      <span>:</span>
                    </span>
                  )}
                  <p
                    style={{
                      textAlign:
                        message.sender.id === user?._id ? "right" : "left",
                    }}
                  >
                    {message.text}
                  </p>

                  {message.status && <span>{message.status}</span>}
                </li>
              ))
            ) : (
              <div>No messages yet.</div>
            )}
          </ul>
        ))}
        <div ref={chatEndRef} />
      </div>
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
        <button type="submit">Send</button>
      </form>
      <p>{activity}</p>
    </div>
  );
};

export default ChatDisplay;
