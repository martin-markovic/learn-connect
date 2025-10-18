import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserList,
  getFriendList,
  handleBlock,
  resetUserList,
} from "../features/friend/friendSlice.js";
import {
  getExamScores,
  resetExam,
} from "../features/quizzes/exam/examSlice.js";
import socketEventManager from "../features/socket/managers/socket.eventManager.js";

import UserForm from "../components/users/UserForm.jsx";
import ProfileHeader from "../components/users/ProfileHeader.jsx";
import FriendshipModal from "../components/friends/FriendshipModal.jsx";
import FriendList from "../components/friends/FriendList.jsx";
import ExamScores from "../components/exam/ExamScores.jsx";

function UserProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const { userId } = useParams();
  const {
    isLoading: friendsLoading,
    userList = [],
    friendList = [],
  } = useSelector((state) => state.friends);
  const dispatch = useDispatch();
  const { isLoading: authLoading, user } = useSelector(
    (state) => state.auth || {}
  );
  const { isLoading: examLoading, examScores } = useSelector(
    (state) => state.exam || {}
  );
  const { _id: authUserId, name: userName } = user || {};

  useEffect(() => {
    const statesReady = !authLoading && !friendsLoading && !examLoading;

    setPageReady(statesReady);
  }, [authLoading, friendsLoading, examLoading]);

  const friendshipStatus = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(authUserId)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(authUserId))
    );
    return relation?.status ?? null;
  }, [friendList, userId, authUserId]);

  const isBlocked = useMemo(() => {
    const relation = friendList.find(
      (item) =>
        (String(item.senderId) === String(userId) &&
          String(item.receiverId) === String(authUserId)) ||
        (String(item.receiverId) === String(userId) &&
          String(item.senderId) === String(authUserId))
    );
    return relation?.status === "blocked";
  }, [friendList, userId, authUserId]);

  useEffect(() => {
    if (userId === authUserId || !isBlocked) {
      dispatch(getFriendList(userId));
    }

    dispatch(getUserList(userId));

    return () => {
      dispatch(resetExam());
      dispatch(resetUserList());
    };
  }, [dispatch, authUserId, userId, isBlocked]);

  useEffect(() => {
    if (!userList.length || pageReady || !authUserId) return;

    const userFound = userList.find(
      (item) => item.sender._id === userId || item.receiver?._id === userId
    );

    if (!userFound.status || userFound.status === "blocked") return;

    const selectedUser =
      userFound.receiver._id === userId ? userFound.receiver : userFound.sender;

    setUserInfo(selectedUser);
  }, [userList, userId, pageReady, authUserId]);

  useEffect(() => {
    const isFriend = friendList.find(
      (item) =>
        (item.senderId === String(userId) &&
          item.receiverId === String(authUserId)) ||
        (item.receiverId === String(userId) &&
          item.senderId === String(authUserId))
    )?.status;

    if (
      (isFriend === "accepted" || userId === authUserId) &&
      !examScores?.[userId]
    ) {
      dispatch(getExamScores(userId));
    }
  }, [friendList, userId, authUserId, friendshipStatus, examScores, dispatch]);

  useEffect(() => {
    socketEventManager.subscribe("user blocked", (data) => {
      dispatch(handleBlock(data));

      setUserInfo((prev) => (prev && prev._id === data ? null : prev));

      dispatch(getUserList());
      dispatch(getFriendList(authUserId));
    });

    return () => {
      socketEventManager.unsubscribe("user blocked");
    };
  }, [dispatch, authUserId]);

  if (authLoading || friendsLoading || examLoading) {
    return <p>Loading,please wait...</p>;
  }

  if (!userId) {
    return <p>User not found.</p>;
  }

  if (isBlocked) {
    return <p>You cannot interact with this user.</p>;
  }

  if (!userInfo) {
    return <p>User not found.</p>;
  }

  return isEditing ? (
    <UserForm setIsEditing={setIsEditing} />
  ) : (
    <div className="user__profile-container">
      <div className="user__profile-top__box">
        <div>
          <ProfileHeader userInfo={userInfo} />
        </div>

        <section>
          <h1>{userInfo?.name}</h1>
        </section>
        {String(authUserId) === String(userId) && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Edit Account Info
          </button>
        )}
        {String(authUserId) !== String(userId) && (
          <FriendshipModal
            modalData={{
              friendshipStatus,
              friendList,
              authUserId,
              userId,
              userName,
            }}
          />
        )}
      </div>
      <div className="user__profile-bottom__box">
        <div className="user__profile-bottom__box-content">
          {friendList?.length ? (
            <FriendList friendList={friendList} userId={userId} />
          ) : (
            <p>Friend list is empty</p>
          )}
        </div>
        <ExamScores examData={{ userId, examScores }} />
      </div>
    </div>
  );
}

export default UserProfile;
