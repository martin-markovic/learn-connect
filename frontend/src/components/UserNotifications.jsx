import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getNotifications } from "../features/notifications/notificationSlice.js";
import handleNotificationSetup from "../features/notifications/handleNotifications.js";
import emitEvent from "../features/socket/socket.emitEvent.js";

function UserNotifications({ socketInstance }) {
  const [newsOpen, setNewsOpen] = useState(false);
  const { userNotifications } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (socketInstance) {
      return handleNotificationSetup(socketInstance, dispatch);
    }

    return () => {};
  }, [socketInstance, dispatch]);

  const handleOpen = () => {
    setNewsOpen((prev) => !prev);
  };

  const handleMark = (notificationId) => {
    try {
      if (!socketInstance) {
        console.error("Please provide a valid socket instance");
        return;
      }

      const clientData = {
        socketInstance,
        eventName: "mark as read",
        roomData: { notificationId },
      };

      emitEvent(clientData);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMarkAll = () => {
    try {
      const clientData = {
        socketInstance,
        eventName: "mark all as read",
        roomData: {},
      };

      emitEvent(clientData);
    } catch (error) {
      console.error("Error marking all notifications as read: ", error.message);
    }
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
                <li key={`${notification._id}-${index}`}>
                  {notification.message && notification.message.trim() ? (
                    <p>{notification.message}</p>
                  ) : (
                    <p>No message available</p>
                  )}
                  {notification.date ? (
                    <span> {notification.date}</span>
                  ) : (
                    <span>No date available</span>
                  )}
                  <button
                    onClick={() => {
                      handleMark(notification._id);
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
