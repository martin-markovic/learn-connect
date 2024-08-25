import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatMessages, setChatMessages] = useState({});
  const [userClassrooms, setUserClassrooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activity, setActivity] = useState("");
  const {
    classrooms = [],
    isLoading,
    isError,
  } = useSelector((state) => state.classroom);
  const { user } = useSelector((state) => state.auth);

  const activityTimer = useRef(null);

  useEffect(() => {
    if (!isError && !isLoading) {
      const joinedClassrooms = classrooms.filter(
        (classroom) =>
          Array.isArray(classroom.students) &&
          classroom.students.includes(user._id)
      );

      setUserClassrooms(joinedClassrooms);
    }
  }, [classrooms, user._id, isLoading, isError]);

  return (
    <ChatContext.Provider
      value={{
        chatMessages,
        selectedChat,
        setSelectedChat,
        classrooms,
        userClassrooms,
        activity,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
