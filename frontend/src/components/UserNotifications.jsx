import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketEventManager from "../features/socket/socket.eventManager.js";
import {
  resetNotifications,
  getNotifications,
  markNotificationAsRead,
} from "../features/notifications/notificationSlice.js";

function UserNotifications() {
  const [newsOpen, setNewsOpen] = useState(false);
  const { userNotifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    socketEventManager.subscribe("notification marked as read", (data) => {
      dispatch(markNotificationAsRead(data));
    });

    socketEventManager.subscribe("marked all as read", (data) => {
      if (data.success) {
        dispatch(resetNotifications());
      }
    });

    return () => {
      dispatch(resetNotifications());

      socketEventManager.unsubscribe("notification marked as read");
      socketEventManager.unsubscribe("marked all as read");
    };
  }, [dispatch]);

  const handleOpen = () => {
    setNewsOpen((prev) => !prev);
  };

  const handleMark = (notificationId) => {
    socketEventManager.handleEmitEvent("mark as read", {
      senderId: user?._id,
      notificationId,
    });
  };

  const handleMarkAll = () => {
    socketEventManager.handleEmitEvent("mark all as read", {
      senderId: user?._id,
    });
  };

  return (
    <div className="content__scrollable-wrapper">
      <div>
        <span onClick={handleOpen}>Notifications</span>
        {userNotifications.length > 0 ? (
          <span>{userNotifications.length}</span>
        ) : null}
        <button onClick={handleMarkAll}>Mark all as read</button>
      </div>
      <div className="content__scrollable">
        {newsOpen ? (
          <ul>
            {userNotifications && userNotifications.length > 0 ? (
              userNotifications.map((notification, index) => (
                <li key={`notification-${index}`}>
                  {notification?.savedNotification?.message &&
                  notification?.savedNotification?.message.trim() ? (
                    <p>{notification?.savedNotification?.message}</p>
                  ) : (
                    <p>No message available</p>
                  )}
                  {notification?.savedNotification?.date ? (
                    <span> {notification?.savedNotification?.date}</span>
                  ) : (
                    <span>No date available</span>
                  )}
                  <button
                    onClick={() => {
                      handleMark(notification?.savedNotification?._id);
                    }}
                  >
                    Mark as read
                  </button>
                </li>
              ))
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default UserNotifications;
