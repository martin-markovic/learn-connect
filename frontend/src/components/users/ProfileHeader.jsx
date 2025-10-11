import { FaCircleUser } from "react-icons/fa6";

function ProfileHeader({ userInfo }) {
  return (
    <div className="user__profile-avatar">
      {userInfo?.avatar ? (
        <img
          src={userInfo?.avatar}
          alt="user avatar"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <FaCircleUser
            style={{
              width: "100%",
              height: "100%",
              color: "grey",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ProfileHeader;
