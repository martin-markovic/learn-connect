import { useSelector } from "react-redux";
import Chat from "../components/Chat.jsx";
import Newsfeed from "../components/Newsfeed.jsx";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <main className="flex__container-dashboard">
      <div className="flex__container-item">
        <Newsfeed />
      </div>
      <div className="flex__container-item">
        <Chat />
      </div>
    </main>
  );
}
