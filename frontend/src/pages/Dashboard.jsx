import Chat from "../components/chat/Chat.jsx";
import Newsfeed from "../components/quizzes/Newsfeed.jsx";
import Classroom from "../components/classroom/Classroom.jsx";

export default function Dashboard({ socketInstance }) {
  return (
    <main className="flex__container-dashboard">
      <div className="flex__container-item">
        <Newsfeed socketInstance={socketInstance} />
      </div>
      <div className="flex__container-item">
        <Chat socketInstance={socketInstance} />
      </div>
      <Classroom />
    </main>
  );
}
