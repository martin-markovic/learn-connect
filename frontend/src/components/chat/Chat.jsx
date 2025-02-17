import { useContext } from "react";
import { ChatContext } from "../../context/chatContext.js";

import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = () => {
  const { selectedChat } = useContext(ChatContext);

  return (
    <div className="conversation">
      <ChatList />
      {selectedChat && <ChatDisplay />}
    </div>
  );
};

export default Chat;
