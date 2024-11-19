import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getNotifications } from "../features/notifications/notificationSlice.js";
import handleNotificationSetup from "../features/notifications/handleNotifications.js";
import {
  emitMarkAllAsRead,
  emitMarkAsRead,
} from "../features/socket/controller/notificationHandlers.js";

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

  const handleMark = async (notificationId) => {
    try {
      await emitMarkAsRead(socketInstance, notificationId);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMarkAll = async () => {
    try {
      await emitMarkAllAsRead(socketInstance);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <div>
        <span onClick={handleOpen}>Notifications</span>
        {userNotifications.length > 0 ? (
          <span>{userNotifications.length}</span>
        ) : null}
        <button onClick={handleMarkAll}>Mark all as read</button>
      </div>
      <div>
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
    </>
  );
}

export default UserNotifications;
