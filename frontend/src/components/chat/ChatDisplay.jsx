import {
  useState,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../context/chatContext.js";

import socketEventManager from "../../features/socket/socket.eventManager.js";

import { FaCircleUser } from "react-icons/fa6";

const ChatDisplay = () => {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTyping = useRef(false);
  const parentContainerRef = useRef(null);
  const isEngagedRef = useRef(false);

  const navigate = useNavigate();

  const {
    selectedChat,
    setSelectedChat,
    activity,
    setActivity,
    chatScroll,
    setChatScroll,
    onlineList,
  } = useContext(ChatContext);

  const { user } = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat.chat);
  const chatLength = chat[selectedChat?.id]?.length;

  useEffect(() => {
    if (!selectedChat?.id) return;

    const handleClick = (e) => {
      const engaged = parentContainerRef.current?.contains(e.target);
      if (isEngagedRef.current !== engaged) {
        isEngagedRef.current = engaged;
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);

      isEngagedRef.current = false;
    };
  }, [selectedChat?.id]);

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

    // eslint-disable-next-line
  }, [chatLength]);

  useLayoutEffect(() => {
    if (
      !chatEndRef.current ||
      !selectedChat?.id ||
      chatScroll.eventType === "send message"
    )
      return;

    if (chatScroll.isScrolling) {
      if (chatScroll.eventType === "new message" && isEngagedRef.current)
        return;

      chatEndRef.current.scrollIntoView({
        behavior: chatScroll.eventType === "new message" ? "smooth" : "instant",
        block: "end",
      });

      setChatScroll((prevState) => ({
        ...prevState,
        isScrolling: false,
        eventType: null,
      }));
    }
  }, [
    chatLength,
    chatScroll.isScrolling,
    chatScroll.eventType,
    setChatScroll,
    selectedChat?.id,
  ]);

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
    <div ref={parentContainerRef} className="chat__display-container">
      <div className="chat__display-heading">
        <div className="chat__display__heading-text">
          <span>Chat with </span>
          <span className="chat__display__heading-userinfo">
            <span
              style={{
                width: "30px",
                height: "30px",
              }}
            >
              {selectedChat?.avatar ? (
                <img
                  className="chat__display__heading-avatar"
                  src={selectedChat?.avatar}
                  alt="avatar"
                ></img>
              ) : (
                <div className="chat__display__heading-icon">
                  <FaCircleUser
                    style={{ width: "100%", height: "100%", color: "grey" }}
                  />
                </div>
              )}
            </span>

            <span
              title={`visit ${selectedChat?.name.split(" ")[0]}'s profile`}
              className="clickable"
              onClick={() => {
                navigate(`profile/${selectedChat?.id}`);
              }}
            >
              {selectedChat?.name}
            </span>

            {onlineList.includes(selectedChat?.id) && (
              <span className="chatlist__user-status"></span>
            )}
          </span>
        </div>
        <button
          title="Close Chat"
          className="chat__display-close clickable"
          type="button"
          onClick={() => {
            setSelectedChat(null);
          }}
        >
          X
        </button>
      </div>

      <div className="content__scrollable">
        <ul className="chat__message-list">
          {chat[selectedChat?.id] && chat[selectedChat?.id]?.length > 0 ? (
            chat[selectedChat?.id]?.map((message) => (
              <li
                className={`message ${
                  message?.senderId === user?._id
                    ? "chat__item-sender"
                    : "chat__item-receiver"
                }`}
                key={message?._id}
              >
                {message.senderAvatar ? (
                  <img
                    src={message?.senderAvatar}
                    alt="user avatar"
                    style={{
                      alignSelf:
                        message?.senderId === user?._id
                          ? "center"
                          : "flex-start",
                      marginLeft:
                        message?.senderId === user?._id ? "2.8em" : "0",
                    }}
                    className={`chat-avatar ${
                      message?.senderId === user?._id
                        ? "chat__item-sender"
                        : "chat__item-receiver"
                    }`}
                  />
                ) : (
                  <div
                    className="chat-avatar chat__icon"
                    style={{
                      alignSelf:
                        message?.senderId === user?._id
                          ? "flex-end"
                          : "flex-start",
                      marginRight:
                        message?.senderId === user?._id ? "0.8em" : "0",
                    }}
                  >
                    <FaCircleUser
                      style={{
                        width: "100%",
                        height: "100%",
                        color: "grey",
                      }}
                    />
                  </div>
                )}

                <span
                  style={{
                    alignSelf:
                      message?.senderId === user?._id
                        ? "flex-end"
                        : "flex-start",
                    paddingRight: message?.senderId === user?._id ? "1em" : "0",
                  }}
                >
                  <strong>
                    {message?.senderId === user?._id
                      ? "You"
                      : message?.senderName}
                  </strong>
                  :{" "}
                </span>

                <p
                  style={{
                    alignSelf:
                      message?.senderId === user?._id
                        ? "flex-end"
                        : "flex-start",
                    marginRight: message?.senderId === user?._id ? "1em" : "0",
                  }}
                >
                  {message?.text}
                </p>
                {message.senderId === user?._id && (
                  <span className="chat__message-status">
                    {message?.isRead ? "read" : "sent"}
                  </span>
                )}
              </li>
            ))
          ) : (
            <div style={{ alignSelf: "center", paddingTop: "30%" }}>
              <span style={{ paddingLeft: "3em" }}>No messages.</span>
              <br />
              New messages will appear here.
            </div>
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
