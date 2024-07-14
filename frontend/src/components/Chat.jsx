import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState("");
  const socket = useRef(null);
  let activityTimer = useRef(null);

  useEffect(() => {
    socket.current = io("ws://localhost:8000");

    socket.current.on("chat message", (data) => {
      setActivity("");
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.current.on("chat activity", (name) => {
      setActivity(`${name} is typing...`);
      clearTimeout(activityTimer.current);
      activityTimer.current = setTimeout(() => {
        setActivity("");
      }, 3000);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.current.emit("chat message", message);
      setMessage("");
      setActivity("");
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = () => {
    socket.current.emit("chat activity", socket.current.id.substring(0, 5));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type message"
        />
        <input type="submit" value="Send" />
      </form>
      <p>{activity}</p>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
