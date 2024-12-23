import { useState } from "react";
import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = ({ socketInstance }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="conversation">
      <ChatList
        socketInstance={socketInstance}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <ChatDisplay
        selectedChat={selectedChat}
        socketInstance={socketInstance}
      />
    </div>
  );
};

export default Chat;
