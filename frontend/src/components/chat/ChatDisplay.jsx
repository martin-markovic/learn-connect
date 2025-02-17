import { useSelector, useDispatch } from "react-redux";
import { ChatContext } from "../../context/chatContext.js";

import socketEventManager from "../../features/socket/socket.eventManager.js";
import {
  removeMessages,
} from "../../features/chat/chatSlice.js";

  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const dispatch = useDispatch();

  const {
    selectedChat,
    activity,
    setActivity,
    scrollToBottom,
    setScrollToBottom,
  } = useContext(ChatContext);

  const { user } = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat.chat);

  useEffect(() => {
    if (!isUnmounting.current) return;


      }

  useEffect(() => {
    if (scrollToBottom) {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setScrollToBottom(false);
    }
  }, [scrollToBottom]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChat && user?._id) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    const eventData = {
      senderId: user?._id,
      receiverId: selectedChat?.id,
      senderName: user?.name,
      text: input,
    };

    socketEventManager.handleEmitEvent("send message", eventData);

    setInput("");
    setActivity("");
  };

  const handleKeyPress = () => {
    if (!selectedChat) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    const eventData = {
      senderId: user?._id,
      receiverId: selectedChat?.id,
      senderName: user?.name,
    };

    socketEventManager.handleEmitEvent("user typing", eventData);
  };

  const handleRemove = () => {
    if (selectedChat) {
      try {
        const messageIds = chat[selectedChat].map((message) => message._id);

        if (messageIds.length === 0 || !messageIds) {
          throw new Error("Chat history is already empty");
        }

        const chatData = { selectedChat, messageIds };

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

  return (
    <div className="content__scrollable-wrapper">
      <h3>Chat with {selectedChat?.name}</h3>

      <div className="content__scrollable">
        {Object.keys(chat || {}).map((chatId) => {
          return (
            <ul key={chatId}>
              {chat[chatId] && chat[chatId]?.length > 0 ? (
                chat[chatId]?.map((message) => (
                  <li
                    key={message?._id}
                    style={{
                      marginRight: "1em",
                      textAlign:
                        message.senderId === user?._id ? "right" : "left",
                    }}
                  >
                    {message.senderId !== user?._id && (
                      <span>
                        <strong>{message?.senderName}</strong>:{" "}
                      </span>
                    )}
                    <p>{message.text}</p>
                    <span>{message.isRead ? "read" : "sent"}</span>
                  </li>
                ))
              ) : (
                <div>No messages yet.</div>
              )}
            </ul>
          );
        })}
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
