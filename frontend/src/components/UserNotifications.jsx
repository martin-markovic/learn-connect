import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocketContext } from "../features/socket/socketContext";
import {
  getNotifications,
  addNewNotification,
  markNotificationAsRead,
  resetNotifications,
} from "../features/notifications/notificationSlice.js";
  emitMarkAllAsRead,
  emitMarkAsRead,
} from "../features/socket/controller/notificationHandlers.js";

function UserNotifications() {
  const [newsOpen, setNewsOpen] = useState(false);
  const { socketInstance } = useSocketContext();
  const { userNotifications } = useSelector((state) => state.notifications);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("notification received", (data) => {
        const newNotification = data;

        dispatch(addNewNotification(newNotification));
      });

      socketInstance.on("notification marked as read", (data) => {
        const notificationId = data;
        dispatch(markNotificationAsRead(notificationId));
      });

      socketInstance.on("marked all as read", (data) => {
        dispatch(resetNotifications());
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.off("notification received");
        socketInstance.off("notification marked as read");
        socketInstance.off("marked all as read");
      }
    };
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
