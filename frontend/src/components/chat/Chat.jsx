import { useContext } from "react";
import { ChatContext } from "../../context/chatContext.js";

import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";
import { useSelector } from "react-redux";

const Chat = () => {
  const { selectedChat } = useContext(ChatContext);
  const online = useSelector((state) => state.chat.online);

  return (
    <div className="conversation">
      <ChatList />
      {selectedChat && online && <ChatDisplay />}
    </div>
  );
};

export default Chat;
