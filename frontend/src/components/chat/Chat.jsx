import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = () => {
  return (
    <div className="conversation">
      <ChatList />
      <ChatDisplay />
    </div>
  );
};

export default Chat;
