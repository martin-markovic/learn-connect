import ChatProvider from "../context/chatContext.js";

import Chat from "../components/chat/Chat.jsx";
import Newsfeed from "../components/quizzes/Newsfeed.jsx";
import Classroom from "../components/classroom/Classroom.jsx";

export default function Dashboard() {
  return (
    <main className="flex__container-dashboard">
      <div className="flex__container-item">
        <Newsfeed />
      </div>
      <ChatProvider>
        <div className="flex__container-item">
          <Chat />
        </div>
      </ChatProvider>
      <Classroom />
    </main>
  );
}
