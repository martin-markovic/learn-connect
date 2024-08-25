import { ChatProvider } from "../../features/chat/chatContext.js";
import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = () => {
  return (
    <ChatProvider>
      <div className="conversation">
        <ChatList />
        <ChatDisplay />
      </div>
    </ChatProvider>
  );
};

export default Chat;
