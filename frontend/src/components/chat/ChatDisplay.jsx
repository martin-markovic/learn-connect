import { useEffect } from "react";
import { useChatContext } from "../../features/chat/chatContext.js";
import {
  sendClassroomMessage,
  getUserMessages,
} from "../../features/chat/chatSlice.js";

function ChatDisplay() {
  const {
    chatMessages,
    setChatMessages,
    activity,
    setActivity,
    selectedChat,
    setSelectedChat,
    socketInstance,
    toast,
    message,
    setMessage,
  } = useChatContext();

  useEffect(() => {
    if (selectedChat && selectedChat.name) {
      setChatMessages((prevMessages) => ({
        ...prevMessages,
        [selectedChat.name]: prevMessages[selectedChat.name] || [],
      }));
    }
  }, [selectedChat, chatMessages, setChatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message && selectedChat && selectedChat.name) {
      try {
        socketInstance.emit("chat message", { user: selectedChat, message });
        setChatMessages((prevMessages) => ({
          ...prevMessages,
          [selectedChat.name]: [
            ...(prevMessages[selectedChat.name] || []),
            message,
          ],
        }));
        setMessage("");
        setActivity("");
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = () => {
    try {
      if (selectedChat && typeof selectedChat === "object" && socketInstance) {
        // implement broadcast if receiver is classroom
        socketInstance.emit(
          "chat activity",
          socketInstance.current.id.substring(0, 5)
        );
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Please select a classmate");
    }
  };

  const handleClick = (student) => {
    setSelectedChat(student);
  };

  return (
    <div className="conversation-list">
      {selectedChat &&
      Array.isArray(selectedChat) &&
      selectedChat.some((char) => !isNaN(char)) ? (
        selectedChat.length > 0 ? (
          <div>
            <h3>Classmates</h3>
            <ul>
              {selectedChat.students &&
                selectedChat.students.map((student) => (
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
            {(chatMessages[selectedChat?.name] || []).map((msg, index) => (
              <li key={`message-${index}`}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChatDisplay;
