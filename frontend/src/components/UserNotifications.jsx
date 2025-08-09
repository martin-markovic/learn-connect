import { useEffect, useRef, useState } from "react";
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
  const clickRef = useRef();

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

  useEffect(() => {
    function handleClick(e) {
      if (clickRef.current) {
        if (!clickRef.current.contains(e.target)) {
          setNewsOpen(false);
        }
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

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
    <div
      className="content__scrollable-wrapper notification-container"
      ref={clickRef}
    >
      <div onClick={handleOpen} className="notification-heading clickable">
        <div
          style={{
            width: "30%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "0.5em",
            marginLeft: "1.5em",
          }}
        >
          <span style={{ position: "relative" }}>
            Notifications
            {userNotifications.length > 0 ? (
              <span className="notification-count">
                {userNotifications.length}
              </span>
            ) : null}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAll();
          }}
        >
          Mark all as read
        </button>
      </div>
      <div className="content__scrollable notification-display">
        {newsOpen ? (
          <ul>
            {userNotifications && userNotifications.length > 0 ? (
              userNotifications.map((notification, index) => (
                <li key={`notification-${index}`}>
                  {notification?.message && notification?.message.trim() ? (
                    <p>{notification?.message}</p>
                  ) : (
                    <p>No message available</p>
                  )}
                  <div className="notification-controller">
                    <span>
                      {notification?.date
                        ? "Received: " +
                          notification?.date.split(" ")[0] +
                          ", at " +
                          notification?.date.split(" ")[1]
                        : null}
                    </span>
                    <button
                      onClick={() => {
                        handleMark(notification?._id);
                      }}
                    >
                      Mark as read
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li style={{ padding: "0.7em 0", textAlign: "center" }}>
                No new notifications
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default UserNotifications;
