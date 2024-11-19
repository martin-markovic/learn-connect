import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import emitRoomEvent from "../../features/socket/controller/roomHandlers.js";

function ChatList() {
  const [listOpen, setListOpen] = useState(false);
  const {
    isError,
    isLoading,
    friendList = [],
  } = useSelector((state) => state.friends);

  const dispatch = useDispatch();

  const handleOpen = () => {
    if (userClassrooms.length > 0) {
      const roomNames = userClassrooms.map((classroom) => classroom.name);

      const roomData = {
        roomNames,
      };

      const clientData = {
        socketInstance,
        roomData,
        eventName: "join room",
      };

      emitRoomEvent(clientData);
    }

    setListOpen(!listOpen);
  };

  const handleClose = () => {
    if (userClassrooms.length > 0) {
      const roomNames = userClassrooms.map((classroom) => classroom.name);

      console.log("handleClose room data: ", { roomNames });

      const roomData = {
        roomNames,
      };

      const clientData = {
        socketInstance,
        eventName: "leave room",
        roomData,
      };

      emitRoomEvent(clientData);
    }

    setListOpen(!listOpen);
  };

  const handleSelect = (receiver) => {
    setSelectedChat(receiver);
  };

  useEffect(() => {
    dispatch(getUserClassrooms());
  }, [dispatch]);

  return (
    <div>
      {!listOpen ? (
        <button onClick={handleOpen}>Open</button>
      ) : (
        <div>
          <button onClick={handleClose}>Close</button>
          {isError ? (
            <p>
              An error occurred while fetching your classrooms. Please try again
              later.
            </p>
          ) : userClassrooms && userClassrooms.length > 0 ? (
            <div>
              <h3>Your Classrooms:</h3>
              <ul>
                {userClassrooms.map((classroom) => (
                  <li
                    key={`chat-${classroom?._id}`}
                    style={{
                      cursor: "pointer",
                      fontWeight:
                        classroom === selectedChat ? "bold" : "normal",
                    }}
                    onClick={() => handleSelect(classroom.name)}
                  >
                    {classroom.name || "Unnamed Classroom"}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !isLoading && (
              <p>You are not currently enrolled in any classroom.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default ChatList;
