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

  const handleSelect = (receiver) => {
    setSelectedChat(receiver);

    socketEventManager.handleEmitEvent("open chat", {
      senderId: user?._id,
      receiverId: receiver,
    });
  };

  return (
    <div>
      <>
        <button
          onClick={() => {
            setListOpen(!listOpen);
            if (listOpen) {
              setSelectedChat(null);
            }
          }}
        >
          {listOpen ? "Close" : "Open"}
        </button>
      </>
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
                      key={`chat-${index}`}
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleSelect(
                          entry.senderId === user?._id
                            ? entry.receiverId
                            : entry.senderId
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
