import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addMessage,
  getMessages,
  removeMessages,
  updateMessageStatus,
} from "../../features/chat/chatSlice.js";
import emitEvent from "../../features/socket/socket.emitEvent.js";

const ChatDisplay = ({ socketInstance, selectedChat }) => {
  const [input, setInput] = useState("");
  const [activity, setActivity] = useState("");
  const activityTimer = useRef(null);
  const chatEndRef = useRef(null);

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const chat = useSelector((state) => state.chat.chat);

  useEffect(() => {
    if (user?._id) {
      dispatch(getMessages(user?._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("new message", (data) => {
        dispatch(addMessage(data));

        if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }

        setActivity("");

        if (selectedChat && selectedChat.id === data.senderId) {
          try {
            const eventData = {
              senderId: data?.senderId,
              receiverId: data?.receiverId,
              messageId: data?._id,
            };

            const clientData = {
              socketInstance,
              eventName: "status update",
              eventData,
            };

            emitEvent(clientData);
          } catch (error) {
            console.error("Error updating message status: ", error.message);
          }
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

      socketInstance.on("messages read", (data) => {
        dispatch(
          updateMessageStatus({
            chatId: data?.chatId,
            messageIds: data?.messageIds,
          })
        );
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("chat activity");
        socketInstance.off("new message");
        socketInstance.off("messages read");
      }
    };
  }, [socketInstance, dispatch, selectedChat, user?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChat && socketInstance && user?._id) {
      console.error("Please select a chat and provide valid socket instance.");
      return;
    }

    try {
      const eventData = {
        senderId: user?._id,
        receiverId: selectedChat?.id,
        senderName: user?.name,
        text: input,
      };

      const clientData = {
        socketInstance,
        eventName: "send message",
        eventData,
      };

      emitEvent(clientData);

      setInput("");
      setActivity("");

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

  const handleKeyPress = () => {
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
