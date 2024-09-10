import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChatContext } from "../../features/chat/chatContext.js";
import { getUserClassrooms } from "../../features/classroom/classroomSlice.js";

function ChatList() {
  const { selectedChat, setSelectedChat } = useChatContext();
  const {
    isError,
    isLoading,
    userClassrooms = [],
  } = useSelector((state) => state.classroom);

  const dispatch = useDispatch();

  const handleSelect = (receiver) => {
    setSelectedChat(receiver);
  };

  useEffect(() => {
    dispatch(getUserClassrooms());
  }, [dispatch]);

  return (
    <div>
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
                key={`chat-${classroom._id}`}
                style={{
                  cursor: "pointer",
                  fontWeight: classroom === selectedChat ? "bold" : "normal",
                }}
                onClick={() => handleSelect(classroom.name)}
              >
                {classroom.name || "Unnamed Classroom"}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !isLoading && <p>You are not currently enrolled in any classroom.</p>
      )}
    </div>
  );
}

export default ChatList;
