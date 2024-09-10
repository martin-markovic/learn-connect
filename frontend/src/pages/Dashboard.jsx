import { ChatProvider } from "../features/chat/chatContext.js";
import Chat from "../components/chat/Chat.jsx";
import Newsfeed from "../components/quizzes/Newsfeed.jsx";
import Classroom from "../components/classroom/Classroom.jsx";

export default function Dashboard() {
  return (
    <ChatProvider>
      <main className="flex__container-dashboard">
        <div className="flex__container-item">
          <Newsfeed />
        </div>
        <div className="flex__container-item">
          <Chat />
        </div>
        <Classroom />
      </main>
    </ChatProvider>
  );
}
