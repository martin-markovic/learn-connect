import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocketContext } from "../features/socket/socketContext";
import {
  getNotifications,
} from "../features/notifications/notificationSlice.js";
import { setNewNotifications } from "../features/notifications/notificationSlice.js";

function UserNotifications() {
  const [newsOpen, setNewsOpen] = useState(false);
  const { socketInstance } = useSocketContext();
  const { userNotifications, newNotifications } = useSelector(
    (state) => state.notifications
  );

  const dispatch = useDispatch();

  const handleOpen = () => {
    dispatch(getNotifications());
  useEffect(() => {
    if (newNotifications) {
      dispatch(getNotifications());
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
      }

      setNewsOpen((prev) => !prev);
    }
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
              userNotifications.map((notification) => (
                <li key={notification._id}>
                  {notification.message ? (
                    <p>{`${notification.message}`}</p>
                  ) : (
                    <p>No message available</p>
                  )}
                  <span>{notification.date}</span>
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
              <p>No new notifications</p>
            )}
          </ul>
        ) : null}
      </div>
    </>
  );
}

export default UserNotifications;
