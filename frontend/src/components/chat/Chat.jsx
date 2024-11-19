import ChatList from "./ChatList.jsx";
import ChatDisplay from "./ChatDisplay.jsx";

const Chat = ({ socketInstance }) => {
  return (
    <div className="conversation">
      <ChatList />
      <ChatDisplay />
        socketInstance={socketInstance}
    </div>
  );
};

export default Chat;
