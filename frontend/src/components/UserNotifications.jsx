import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocketContext } from "../features/socket/socketContext";
import {
  getNotifications,
  setNewNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../features/notifications/notificationSlice.js";

function UserNotifications() {
  const [newsOpen, setNewsOpen] = useState(false);
  const { socketInstance } = useSocketContext();
  const { userNotifications, newNotifications } = useSelector(
    (state) => state.notifications
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("notification received", (data) => {
        dispatch(setNewNotifications());
      });
    }
  }, [dispatch, newNotifications]);

  const handleOpen = async () => {
    if (!newsOpen) {
      if (newNotifications) {
        try {
          dispatch(getNotifications());
        } catch (error) {
          console.error("Error fetching notifications: ", error);
        }
    return () => {
      if (socketInstance) {
        socketInstance.off("notification received");
      }
    };
  }, [socketInstance, dispatch]);

      setNewsOpen((prev) => !prev);
  useEffect(() => {
    if (newNotifications) {
      dispatch(getNotifications());
    }
  }, [newNotifications, dispatch]);
  const handleOpen = () => {
    setNewsOpen((prev) => !prev);
  };

  const handleMark = async (notificationId) => {
  };
  const handleMarkAll = async () => {
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
