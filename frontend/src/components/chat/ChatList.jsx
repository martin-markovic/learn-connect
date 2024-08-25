import { useSelector } from "react-redux";
import { useChatContext } from "../../features/chat/chatContext.js";

function ChatList() {
  const { selectedChat, setSelectedChat, classrooms } = useChatContext();
  const { isError, isLoading } = useSelector((state) => state.classroom);

  const handleSelect = (receiver) => {
    setSelectedChat(receiver);
  };

  return (
    <div>
      {isError ? (
        <p>
          An error occurred while fetching your classrooms. Please try again
          later.
        </p>
      ) : classrooms.length > 0 ? (
        <div>
          <h3>Your Classrooms:</h3>
          <ul>
            {classrooms.map((classroom) => (
              <li
                key={classroom._id}
                style={{
                  cursor: "pointer",
                  fontWeight: classroom === selectedChat ? "bold" : "normal",
                }}
                onClick={() => handleSelect(classroom.name)}
              >
                {classroom.name}
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
