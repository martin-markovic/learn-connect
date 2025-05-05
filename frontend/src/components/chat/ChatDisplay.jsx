import {
  useState,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const {
    selectedChat,
    setSelectedChat,
    activity,
    setActivity,
    chatScroll,
    setChatScroll,
  } = useContext(ChatContext);

  const { user } = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat.chat);
  useEffect(() => {
    if (chatScroll.isScrolling && chatScroll.eventType === "send message") {
      chatEndRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });


      setChatScroll((prevState) => ({
        ...prevState,
        isScrolling: false,
        eventType: null,
      }));
    }
  }, [chatLength]);

  useLayoutEffect(() => {
    if (selectedChat?.id && chat[selectedChat.id]?.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [selectedChat?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChat?.id && user?._id) {
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
    setChatScroll((prevState) => ({
      ...prevState,
      isScrolling: true,
      eventType: "send message",
    }));
  };

  const handleEmitTyping = () => {
    if (!selectedChat?.id) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    const eventData = {
      senderId: user?._id,
      receiverId: selectedChat?.id,
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

  return (
    <div className="content__scrollable-wrapper">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ paddingLeft: "0.8em" }}>
          Chat with{" "}
          <span
            title={`visit ${selectedChat?.name.split(" ")[0]}'s profile`}
            className="clickable"
            onClick={() => {
              navigate(`profile/${selectedChat?.id}`);
            }}
          >
            {selectedChat?.name}
          </span>
        </h3>
        <button
          style={{ maxHeight: "30%" }}
          type="button"
          onClick={() => {
            setSelectedChat(null);
          }}
        >
          X
        </button>
      </div>

      <div className="content__scrollable">
        <ul style={{ padding: "0 1em" }}>
          {chat[selectedChat?.id] && chat[selectedChat?.id]?.length > 0 ? (
            chat[selectedChat?.id]?.map((message) => (
              <li
                style={{
                  margin: "1em 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    message?.senderId === user?._id ? "flex-end" : "flex-start",
                  gap: "0.5em",
                }}
                key={message?._id}
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

                <span>
                  <strong>
                    {message?.senderId === user?._id
                      ? "You"
                      : message?.senderName}
                  </strong>
                  :{" "}
                </span>

                <p>{message?.text}</p>
                <span>{message?.isRead ? "read" : "sent"}</span>
              </li>
            ))
          ) : (
            <div>No messages yet.</div>
          )}
        </ul>
        <div ref={chatEndRef} />
      </div>

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
