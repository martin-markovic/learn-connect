import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSocket from "../hooks/useSocket.js";
import { getUserMessages } from "../features/chat/chatService.js";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [activity, setActivity] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [userClassrooms, setUserClassrooms] = useState([]);

  const {
    classrooms = [],
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;
  const { socket, activityTimer } = useSocket("http://localhost:8000", token);

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

  useEffect(() => {
    if (!isLoading && !isError && classrooms.length > 0) {
      const joinedClassrooms = classrooms.filter(
        (classroom) =>
          Array.isArray(classroom.students) &&
          classroom.students.includes(user._id)
      );

      setUserClassrooms(joinedClassrooms);
    }
  }, [classrooms, user._id, isLoading, isError]);

  useEffect(() => {
    if (isError && errorMessage) {
      console.error("Error in Chat component: ", errorMessage);
    }
  }, [isError, errorMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message && selectedFriend) {
      socket.current.emit("chat message", { friend: selectedFriend, message });
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedChat]: [...(prevMessages[selectedChat] || []), message],
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
    <div className="conversation">
      <div className="conversation-list">
        {selectedChat &&
        Array.isArray(selectedChat) &&
        selectedChat.some((char) => !isNaN(char)) ? (
          selectedChat.length > 0 ? (
            <div>
              <h3>Classmates</h3>
              <ul>
                {selectedChat.students.map((student) => (
                  <li
                    key={student.name}
                    onClick={() => handleClick(student)}
                    style={{
                      cursor: "pointer",
                      fontWeight: student === selectedChat ? "bold" : "normal",
                    }}
                  >
                    {student}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No other students are enrolled in this classroom.</p>
          )
        ) : (
          <div className="conversation-display">
            <h3>
              Chat with{" "}
              {selectedChat && typeof selectedChat === "object"
                ? selectedChat.name
                : selectedChat}
            </h3>
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
              {(messages[selectedChat] || []).map((msg, index) => (
                <li key={`message-${index}`}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          {userClassrooms.length > 0 ? (
            <div>
              <h3>Your Classrooms:</h3>
              <ul>
                {userClassrooms.map((classroom) => (
                  <li
                    key={classroom._id}
                    style={{
                      cursor: "pointer",
                      fontWeight:
                        classroom === selectedChat ? "bold" : "normal",
                    }}
                    onClick={() => handleClick(classroom.name)}
                  >
                    {classroom.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !isLoading && (
              <p>You are not currently enrolled in any classrooms.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
