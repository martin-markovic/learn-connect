import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFriendList } from "../../features/friend/friendSlice.js";
import emitEvent from "../../features/socket/socket.emitEvent.js";

function ChatList({ socketInstance, selectedChat, setSelectedChat }) {
  const [listOpen, setListOpen] = useState(false);
  const {
    isError,
    isLoading,
    friendList = [],
  } = useSelector((state) => state.friends);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const handleSelect = (receiver) => {
    setSelectedChat(receiver);

    try {
      const eventData = {
        senderId: user?._id,
        receiverId: receiver.id,
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
  };

  useEffect(() => {
    dispatch(getFriendList());
  }, [dispatch]);

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
                {friendList.map((friend) => {
                  return (
                    <li
                      key={`chat-${friend?._id}`}
                      style={{
                        cursor: "pointer",
                        fontWeight:
                          friend?.name === selectedChat ? "bold" : "normal",
                      }}
                      onClick={() => handleSelect(friend)}
                    >
                      {friend?.name || "Unnamed friend"}
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
