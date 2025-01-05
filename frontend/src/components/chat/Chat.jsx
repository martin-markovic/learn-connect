import { useState } from "react";
import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="conversation">
      <ChatList selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      {selectedChat && <ChatDisplay selectedChat={selectedChat} />}
    </div>
  );
};

export default Chat;
