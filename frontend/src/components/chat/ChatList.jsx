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

  const { setSelectedChat } = useContext(ChatContext);

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
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          style={{ alignSelf: "flex-end" }}
          onClick={() => {
            setListOpen(!listOpen);
            if (listOpen) {
              setSelectedChat(null);
            }
          }}
        >
          {listOpen ? "Close Chat" : "Open Chat"}
        </button>
      </div>
      {listOpen && (
        <div>
          {isError ? (
            <p>
              An error occurred while fetching your friend list. Please try
              again later.
            </p>
          ) : friendList && friendList.length > 0 ? (
            <div>
              <h3>Your Friends:</h3>
              <ul>
                {friendList.map((entry, index) => {
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
                      {entry.senderId === user?._id
                        ? entry.receiverName
                        : entry.senderName}
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
