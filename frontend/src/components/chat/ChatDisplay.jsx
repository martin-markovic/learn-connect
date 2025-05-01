import { useState, useRef, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChatContext } from "../../context/chatContext.js";

import socketEventManager from "../../features/socket/socket.eventManager.js";
import { removeMessages } from "../../features/chat/chatSlice.js";
import { FaCircleUser } from "react-icons/fa6";

const ChatDisplay = () => {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTyping = useRef(false);

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
    if (scrollToBottom) {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setScrollToBottom((prevState) => !prevState);
    }
  }, [scrollToBottom, setScrollToBottom]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChat && user?._id) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    const eventData = {
      senderId: user?._id,
      receiverId: selectedChat,
      senderName: user?.name,
      text: input,
    };

    socketEventManager.handleEmitEvent("send message", eventData);

    setInput("");
    setActivity("");
  };

  const handleEmitTyping = () => {
    if (!selectedChat) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    const eventData = {
      senderId: user?._id,
      receiverId: selectedChat,
      senderName: user?.name,
    };

    socketEventManager.handleEmitEvent("user typing", eventData);
    isTyping.current = true;
  };

  const handleKeyPress = () => {
    if (!selectedChat) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    if (!isTyping.current) {
      handleEmitTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTyping.current = false;
    }, 700);
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
        <ul>
          {chat[selectedChat] && chat[selectedChat]?.length > 0 ? (
            chat[selectedChat]?.map((message) => (
              <li
                key={message?._id}
                style={{
                  marginRight: "1em",
                  textAlign: message?.senderId === user?._id ? "right" : "left",
                }}
              >
                {message.senderAvatar ? (
                  <img
                    src={message?.senderAvatar}
                    alt="user avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "solid grey 1px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "grey",
                    }}
                  >
                    <FaCircleUser
                      style={{
                        width: "100%",
                        height: "100%",
                        color: "white",
                      }}
                    />
                  </div>
                )}
                {message?.senderId !== user?._id && (
                  <span>
                    <strong>{message?.senderName}</strong>:{" "}
                  </span>
                )}
                <p>{message?.text}</p>
                <span>{message?.isRead ? "read" : "sent"}</span>
              </li>
            ))
          ) : (
            <div>No messages yet.</div>
          )}
        </ul>
      </div>
      <div ref={chatEndRef} />
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
