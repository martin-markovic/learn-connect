import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../../features/socket/socket.eventManager.js";
import { getFriendList } from "../../features/friend/friendSlice.js";
import { getMessages } from "../../features/chat/chatSlice.js";
import { ChatContext } from "../../context/chatContext.js";
import { FaCircleUser } from "react-icons/fa6";

function ChatList() {
  const [listOpen, setListOpen] = useState(false);
  const {
    isError,
    isLoading,
    friendList = [],
  } = useSelector((state) => state.friends);
  const { user } = useSelector((state) => state.auth);

  const { setSelectedChat, setChatScroll, onlineList } =
    useContext(ChatContext);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFriendList());
    dispatch(getMessages());
  }, [dispatch, friendList]);

  const handleSelect = (friend) => {
    setSelectedChat(friend);

    const { id } = friend;

    socketEventManager.handleEmitEvent("open chat", {
      senderId: user?._id,
      receiverId: id,
    });

    setChatScroll((prevState) => ({
      ...prevState,
      isScrolling: true,
      eventType: "chat opened",
    }));
  };

  return (
    <div className="friendlist-container">
      <div className="friendlist__container-toggle">
        <button
          onClick={() => {
            setListOpen(!listOpen);
          }}
        >
          {listOpen ? "Close Friend List" : "Open Friend List"}
        </button>
      </div>
      {listOpen && (
        <div className="friendlist__container-wrapper">
          {isError ? (
            <p>
              An error occurred while fetching your friend list. Please try
              again later.
            </p>
          ) : friendList && friendList.length > 0 ? (
            <div className="chatlist-container">
              <h3>Your Friends:</h3>
              <ul className="friendlist">
                {friendList.map((entry, index) => {
                  const isOnline =
                    onlineList?.includes(entry.senderId) ||
                    onlineList?.includes(entry.receiverId);

                  return (
                    <li
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      className="clickable"
                      key={`chat-${index}`}
                      onClick={() =>
                        handleSelect(
                          entry.senderId === user?._id
                            ? {
                                id: entry.receiverId,
                                name: entry.receiverName,
                                avatar: entry?.receiverAvatar,
                              }
                            : {
                                id: entry.senderId,
                                name: entry.senderName,
                                avatar: entry.senderAvatar,
                              }
                        )
                      }
                    >
                      <span
                        style={{
                          width: "25px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {entry.senderId === user?._id ? (
                          entry.receiverAvatar ? (
                            <img
                              src={entry.receiverAvatar}
                              alt="avatar"
                              style={{
                                objectFit: "cover",
                                width: "15px",
                                height: "15px",
                                border: "1px solid grey",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                backgroundColor: "white",
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
                          )
                        ) : entry.senderAvatar ? (
                          <img
                            src={entry.senderAvatar}
                            alt="avatar"
                            style={{
                              objectFit: "cover",
                              width: "22px",
                              height: "22px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              overflow: "hidden",
                              backgroundColor: "white",
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
                      </span>
                      <span>
                        {entry.senderId === user?._id
                          ? entry.receiverName
                          : entry.senderName}
                      </span>
                      {isOnline && (
                        <span className="chatlist__user-status"></span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            !isLoading && <p>There are no online friends.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatList;
