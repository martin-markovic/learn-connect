import { useState, useRef, useEffect } from "react";
import { useSocketContext } from "../../features/socket/socketContext.js";
import { useSelector } from "react-redux";
import emitRoomEvent from "../../features/socket/controller/roomHandlers.js";

const ChatDisplay = () => {
  const [input, setInput] = useState("");
  const { socketInstance, selectedChat } = useSocketContext();
  const [chatMessages, setChatMessages] = useState([]);
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);

  const { user } = useSelector((state) => state.auth);

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

  // const handleInputChange = (e) => {
  //   setMessage(e.target.value);
  // };

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

  return !selectedChat ? (
    <div></div>
  ) : (
    <div className="conversation-display">
      <h3>Chat with {selectedChat}</h3>
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
        {chatMessages.map((msg, index) => (
          <li key={`message-${index}`}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatDisplay;
