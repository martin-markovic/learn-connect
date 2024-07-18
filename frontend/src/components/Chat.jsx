import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [activity, setActivity] = useState("");
  const [friends, setFriends] = useState(["Alice", "Bob", "Charlie"]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const socket = useRef(null);
  let activityTimer = useRef(null);

  useEffect(() => {
    socket.current = io("ws://localhost:8000");

    socket.current.on("chat message", ({ friend, message }) => {
      setActivity("");
      setMessages((prevMessages) => ({
        ...prevMessages,
        [friend]: [...(prevMessages[friend] || []), message],
      }));
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
    if (message && selectedFriend) {
      socket.current.emit("chat message", { friend: selectedFriend, message });
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedFriend]: [...(prevMessages[selectedFriend] || []), message],
      }));
      setMessage("");
      setActivity("");
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = () => {
    if (selectedFriend) {
      socket.current.emit("chat activity", socket.current.id.substring(0, 5));
    }
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div>
      <div>
        <h3>Friends</h3>
        <ul>
          {friends.map((friend, index) => (
            <li
              key={index}
              onClick={() => handleFriendClick(friend)}
              style={{
                cursor: "pointer",
                fontWeight: friend === selectedFriend ? "bold" : "normal",
              }}
            >
              {friend}
            </li>
          ))}
        </ul>
      </div>
      {selectedFriend && (
        <div>
          <h3>Chat with {selectedFriend}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="message"
              name="message"
              value={message}
              autoComplete="off"
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type message"
            />
            <input type="submit" value="Send" />
          </form>
          <p>{activity}</p>
          <ul>
            {(messages[selectedFriend] || []).map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chat;
