import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addMessage,
  getMessages,
  removeMessages,
} from "../../features/chat/chatSlice.js";
import emitEvent from "../../features/socket/socket.emitEvent.js";

const ChatDisplay = ({ socketInstance, selectedChat }) => {
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);
  const chatEndRef = useRef(null);

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const messages = useSelector((state) => state.chat.messages);

  useEffect(() => {
    if (user?._id) {
      dispatch(getMessages(user?._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("new message", (data) => {
        const messageData = data;

        dispatch(addMessage(messageData));

        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      });

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
        socketInstance.off("new message");
      }
    };
  }, [socketInstance, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedChat && socketInstance && user?._id) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    try {
      const eventData = {
        senderId: user?._id,
        receiverId: selectedChat?.id,
        text: input,
      };

      const clientData = {
        socketInstance,
        eventName: "send message",
        eventData,
      };

      emitEvent(clientData);

      setInput("");

      // const eventData = {
      //   senderId: user?._id,
      //   receiverId: selectedChat?.id,
      //   eventName: "new message",
      // };

      // const clientData = {
      //   socketInstance,
      //   eventName: "new notification",
      //   eventData,
      // };

      // emitEvent(clientData);
      // }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleKeyPress = async () => {
    try {
      if (selectedChat && socketInstance) {
        const eventData = {
          senderId: user?._id,
          receiverId: selectedChat?.id,
          senderName: user?.name,
        };

        const clientData = {
          socketInstance,
          eventName: "user typing",
          eventData,
        };

        emitEvent(clientData);
      } else {
        console.error(
          "Please select a chat and provide valid socket instance."
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleRemove = () => {
    if (selectedChat) {
      try {
        const messageIds = messages[selectedChat].map((message) => message._id);

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

  return !selectedChat ? (
    <div></div>
  ) : (
    <div className="conversation-display">
      <h3>Chat with {selectedChat}</h3>

      <div className="conversation-display__chat">
        {Object.keys(messages).map((friend) => (
          <ul key={friend}>
            {messages[friend] && messages[friend].length > 0 ? (
              messages[friend].map((message) => (
                <li key={message._id} style={{ marginRight: "1em" }}>
                  {message.sender.id === user?._id ? null : (
                    <span>
                      <strong>{message.sender.name}</strong>
                      <span>:</span>
                    </span>
                  )}
                  <p
                    style={{
                      textAlign:
                        message.sender.id === user?._id ? "right" : "left",
                    }}
                  >
                    {message.text}
                  </p>

                  {message.status && <span>{message.status}</span>}
                </li>
              ))
            ) : (
              <div>No messages yet.</div>
            )}
          </ul>
        ))}
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
