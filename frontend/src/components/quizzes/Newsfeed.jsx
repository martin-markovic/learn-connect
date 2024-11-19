import UserNotifications from "../UserNotifications.jsx";
import FriendSearch from "../friends/FriendSearch.jsx";

function Newsfeed({ socketInstance }) {
  return (
    <div className="flex__container-item">
      <FriendSearch />
      <div>News filter</div>
      <div className="conversation">
        <UserNotifications />
      </div>
    </div>
  );
}

export default Newsfeed;
