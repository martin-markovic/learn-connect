import { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import socketEventManager from "../../features/socket/socket.eventManager.js";
import { getFriendList } from "../../features/friend/friendSlice.js";
import { getMessages } from "../../features/chat/chatSlice.js";
import { ChatContext } from "../../context/chatContext.js";

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
                      className="clickable"
                      key={`chat-${index}`}
                      onClick={() =>
                        handleSelect(
                          entry.senderId === user?._id
                            ? { id: entry.receiverId, name: entry.receiverName }
                            : { id: entry.senderId, name: entry.senderName }
                        )
                      }
                    >
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
