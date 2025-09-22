import { useContext, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../../features/socket/managers/socket.eventManager.js";
import {
  getFriendList,
  resetUserList,
} from "../../features/friend/friendSlice.js";
import { getChatStatus, getMessages } from "../../features/chat/chatSlice.js";
import { ChatContext } from "../../context/chatContext.js";
import { FaCircleUser } from "react-icons/fa6";
import { PiChatCircleSlashBold, PiChatTeardropDotsBold } from "react-icons/pi";

function ChatList() {
  const [listOpen, setListOpen] = useState(false);
  const {
    isError,
    isLoading,
    friendList = [],
  } = useSelector((state) => state.friends);
  const { user } = useSelector((state) => state.auth);
  const online = useSelector((state) => state.chat?.online);

  const listFetched = useRef(false);

  const { selectedChat, setSelectedChat, setChatScroll, onlineList } =
    useContext(ChatContext);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getChatStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!listFetched.current && user?._id) {
      dispatch(getFriendList(user?._id));

      listFetched.current = true;
    }

    dispatch(getMessages());

    return () => {
      dispatch(resetUserList());
    };
  }, [dispatch, user?._id]);

  const handleSelect = (friend) => {
    const { id } = friend;

    if (selectedChat?.id === id) return;

    setSelectedChat(friend);

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

  const handleChatConnection = () => {
    try {
      socketEventManager.handleEmitEvent("change chat status", {
        userId: user?._id,
        chatConnected: !online,
      });
    } catch (error) {
      console.error("Error handling chat connection: ", error.message);
    }
  };

  return (
    <div className="friendlist-container">
      <div className="friendlist__container-toggle">
        <span>
          <button onClick={handleChatConnection}>
            Go {online ? "Offline" : "Online"}
            {online ? (
              <PiChatCircleSlashBold style={{ marginLeft: "0.5em" }} />
            ) : (
              <PiChatTeardropDotsBold style={{ marginLeft: "0.5em" }} />
            )}
          </button>
        </span>
        <span>
          {online && (
            <button
              onClick={() => {
                setListOpen(!listOpen);
              }}
            >
              {listOpen ? "Close Chat List" : "Open Chat List"}
            </button>
          )}
        </span>
      </div>
      <div
        className={`friendlist__container-wrapper ${
          listOpen && online ? "friendlist-open" : "friendlist-closed"
        }`}
      >
        {listOpen && online && (
          <div
            className={`friendlist__container-online ${
              listOpen && online ? "friendlist-open" : "friendlist-closed"
            }`}
          >
            {isError ? (
              <p>
                An error occurred while fetching your friend list. Please try
                again later.
              </p>
            ) : friendList && friendList.length > 0 ? (
              <div className="chatlist-container">
                <p>Friends:</p>
                <ul className="friendlist">
                  {friendList.map((entry, index) => {
                    const isOnline =
                      onlineList?.includes(entry.senderId) ||
                      onlineList?.includes(entry.receiverId);

                    const isFriend = entry.status === "accepted";

                    if (isFriend)
                      return (
                        <li
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
                          <span className="chatlist__avatar-wrapper">
                            {entry.senderId === user?._id ? (
                              entry.receiverAvatar ? (
                                <img src={entry.receiverAvatar} alt="avatar" />
                              ) : (
                                <div className="chatlist__avatar__icon-container">
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
                              <img src={entry.senderAvatar} alt="avatar" />
                            ) : (
                              <div className="chatlist__avatar__icon-container">
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

                    return null;
                  })}
                </ul>
              </div>
            ) : (
              !isLoading && <p>There are no online friends.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;
