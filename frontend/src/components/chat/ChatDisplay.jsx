import { useState, useRef } from "react";
import { useSocketContext } from "../../features/socket/socketContext.js";
import { useSelector } from "react-redux";

const ChatDisplay = () => {
  const [input, setInput] = useState("");
  const { selectedChat } = useSocketContext();
  const [chatMessages, setChatMessages] = useState([]);
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);

  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  // const handleInputChange = (e) => {
  //   setMessage(e.target.value);
  // };

  const handleKeyPress = () => {
    try {
      if (selectedChat && typeof selectedChat === "object") {
      }
    } catch (error) {
      console.error("Error:", error);
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
