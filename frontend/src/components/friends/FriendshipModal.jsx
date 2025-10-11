import { useState, useRef } from "react";
import socketEventManager from "../../features/socket/managers/socket.eventManager.js";
import { useSelector } from "react-redux";

function FriendshipModal(modalData) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { friendshipStatus, friendList, authUserId, userId, userName } =
    modalData;

  const { isLoading } = useSelector((state) => state.friends);

  const selectRef = useRef(null);

  const handleConfirmAction = () => {
    try {
      const validActions = ["unfriend", "block"];

      if (!validActions.includes(actionToConfirm)) {
        throw new Error(`Invalid action ${actionToConfirm}`);
      }

      const actionName =
        actionToConfirm === "unfriend" ? "remove friend" : "block user";

      socketEventManager.handleEmitEvent(actionName, {
        senderId: authUserId,
        receiverId: userId,
      });
    } catch (error) {
      console.error("Error removing friend: ", error.message);
    }

    setModalOpen(false);
  };

  const handleCancelAction = () => {
    setModalOpen(false);
    if (selectRef.current) {
      selectRef.current.value = "friends";
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;

    setModalOpen(true);
    setActionToConfirm(newStatus);
  };

  const handleSend = () => {
    try {
      if (!userId) {
        throw new Error("Invalid user id");
      }

      if (!authUserId) {
        throw new Error("User not authorized");
      }

      if (friendshipStatus === "sent" || friendshipStatus === "accepted") {
        const errorString =
          friendshipStatus === "sent"
            ? "Friend request already sent"
            : "You are already friends";

        throw new Error(errorString);
      }

      socketEventManager.handleEmitEvent("send friend request", {
        senderId: authUserId,
        receiverId: userId,
        currentStatus: "pending",
      });
    } catch (error) {
      console.error("Error sending friend request: ", error.message);
    }
  };

  const handleProcessRequest = (e) => {
    setIsProcessing(true);

    const friendReqResponse = e.target.dataset.response;

    try {
      const eventData = {
        senderId: authUserId,
        receiverId: userId,
        userResponse: friendReqResponse === "accept" ? "accepted" : "declined",
      };

      socketEventManager.handleEmitEvent("process friend request", eventData);
    } catch (error) {
      console.error("Error processing request :", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {friendshipStatus === "pending" &&
        friendList.find(
          (item) =>
            String(item.senderId) === String(authUserId) &&
            String(item.receiverId) === String(userId)
        ) && <button disabled={true}>Request Sent</button>}
      {friendshipStatus === "pending" &&
        friendList.find(
          (item) =>
            String(item.receiverId) === String(authUserId) &&
            String(item.senderId) === String(userId)
        ) && (
          <div>
            <button
              type="button"
              data-response="accept"
              disabled={isProcessing}
              onClick={handleProcessRequest}
            >
              Accept
            </button>
            <button
              type="button"
              data-response="decline"
              disabled={isProcessing}
              onClick={handleProcessRequest}
            >
              Decline
            </button>
          </div>
        )}
      {friendshipStatus === "accepted" && (
        <div className="friendship-container">
          <select
            name="friendshipStatus"
            id="friendshipStatus"
            defaultValue="friends"
            onChange={handleStatusChange}
            ref={selectRef}
          >
            <option value="friends" hidden>
              Friends
            </option>
            <option value="unfriend">Unfriend</option>
            <option value="block">Block</option>
          </select>
        </div>
      )}
      <div className="modal">
        {modalOpen && (
          <div className="modal-container">
            <p>
              Are you sure you want to {actionToConfirm}
              {userName ? userName : ""}?
            </p>
            <div className="modal-buttons">
              <button onClick={handleConfirmAction}>Yes</button>
              <button onClick={handleCancelAction}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {!isLoading && friendshipStatus === null && !modalOpen && (
        <div>
          <button type="button" onClick={handleSend}>
            Add Friend
          </button>
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setActionToConfirm("block");
            }}
          >
            Block User
          </button>
        </div>
      )}
    </div>
  );
}

export default FriendshipModal;
