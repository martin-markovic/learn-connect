import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaCircleUser } from "react-icons/fa6";
import { MdFileUpload } from "react-icons/md";
import { updateUser } from "../../features/auth/authSlice.js";
import {
  updateUserList,
  updateFriendList,
} from "../../features/friend/friendSlice.js";

function UserForm({ setIsEditing, userDetails }) {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    avatar: null,
    name: null,
    email: null,
    password: null,
    password2: null,
  });
  const [pendingChanges, setPendingChanges] = useState({
    avatar: null,
    name: null,
    email: null,
    password: null,
    password2: null,
  });
  const [editInfo, setEditInfo] = useState({
    avatar: false,
    name: false,
    email: false,
    password: false,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (!userDetails) return;

    setFormData(userDetails);
    setAvatarPreview(userDetails.avatar);
  }, [userDetails]);

  /**
   * Cleans up the object URL for avatar preview when the component unmounts or dependencies change.
   *
   * This hook revokes the URL created for the avatar preview to prevent memory leaks if the avatarPreview is a valid string URL.
   *
   * @returns {void} - Nothing is returned from this effect
   */
  useEffect(() => {
    return () => {
      if (avatarPreview && typeof formData.avatar === "string") {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, formData.avatar]);

  /**
   * handleChange - Handles form input changes, specifically for file and text input fields.
   *
   * - Prevents default form submission behavior (e.preventDefault).
   * - Sets form data state with new value from the input.
   * - Special handling for "avatar" input field (file upload).
   *
   * Important notes:
   * 1. `setEditInfo` is called to prevent editing state from resetting when input is changed. This ensures the form data can persist as users make edits.
   * 2. For file input (avatar), `e.target.value` is set to `null` after the value is set, so that the input can properly receive a new file if selected again (important for file inputs in HTML).
   *
   * @param {Object} e - The event object from the input field.
   */
  const handleChange = (e) => {
    e.preventDefault();

    const targetName = e.target.name;
    const isAvatar = targetName === "avatar";

    const value = isAvatar ? e.target.files[0] : e.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [targetName]: value,
    }));

    if (isAvatar) {
      setPendingChanges((prevState) => ({
        ...prevState,
        [targetName]: value,
      }));
    }

    if (isAvatar && value) {
      setAvatarPreview(URL.createObjectURL(value));
    }

    setEditInfo((prev) => ({ ...prev, [targetName]: true }));

    if (isAvatar) {
      e.target.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const userData = Object.entries(pendingChanges).reduce(
        (acc, [key, value]) => {
          if (key === "avatar") {
            if (value?.name !== userDetails[key]?.name) {
              acc[key] = value;
            }
            return acc;
          }

          if (userDetails[key] !== value) {
            acc[key] = value;
          }

          return acc;
        },
        {}
      );

      dispatch(updateUser(userData)).then((res) => {
        if (res.type === "auth/update/fulfilled") {
          dispatch(updateFriendList(res.payload));
          dispatch(updateUserList(res.payload));
          setIsEditing(false);
        }
      });
    } catch (error) {
      console.error("Error submiting user data: ", error.message);
    }
  };

  const handleEdit = (e) => {
    setEditInfo((prevState) => ({ ...prevState, [e.target.name]: true }));
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: pendingChanges[e.target.name]
        ? pendingChanges[e.target.name]
        : userDetails[e.target.name],
    }));
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="avatar-wrapper">
          {editInfo.avatar ? (
            <>
              {formData?.avatar ? (
                <img
                  src={avatarPreview}
                  alt="new avatar preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <FaCircleUser />
              )}
              <button
                type="button"
                name="avatar"
                onClick={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    [e.target.name]: userDetails[e.target.name],
                  }));
                  setPendingChanges((prevState) => ({
                    ...prevState,
                    [e.target.name]: userDetails[e.target.name],
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                  setAvatarPreview(userDetails.avatar);
                }}
              >
                Cancel
              </button>
            </>
          ) : avatarPreview ? (
            <img
              src={avatarPreview}
              alt="user avatar"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <FaCircleUser />
          )}

          <label className="upload-button clickable">
            <input
              type="file"
              style={{ display: "none" }}
              id="avatar"
              name="avatar"
              accept="image/png, image/jpeg"
              autoComplete="off"
              onChange={handleChange}
            />
            <MdFileUpload />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {editInfo.name ? (
            <>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                value={formData?.name || ""}
              />
              <button
                name="name"
                type="button"
                onClick={(e) => {
                  setPendingChanges((prevState) => ({
                    ...prevState,
                    [e.target.name]: formData[e.target.name],
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                name="name"
                onClick={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    [e.target.name]: userDetails[e.target.name],
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>
                {pendingChanges?.name
                  ? pendingChanges?.name
                  : userDetails?.name}
              </p>
              <button name="name" type="button" onClick={handleEdit}>
                Change Name
              </button>
            </>
          )}

          {editInfo?.email ? (
            <>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formData?.email || ""}
              />
              <button
                name="email"
                type="button"
                onClick={(e) => {
                  setPendingChanges((prevState) => ({
                    ...prevState,
                    [e.target.name]: formData[e.target.name],
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                name="email"
                onClick={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    [e.target.name]: userDetails[e.target.name],
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>
                {pendingChanges?.email
                  ? pendingChanges?.email
                  : userDetails?.email}
              </p>
              <button name="email" type="button" onClick={handleEdit}>
                Change Email
              </button>
            </>
          )}

          {editInfo?.password ? (
            <>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={formData?.password || ""}
                placeholder="new password"
                minLength={8}
              />

              <input
                type="password"
                name="password2"
                onChange={handleChange}
                value={formData?.password2 || ""}
                placeholder="confirm password"
                minLength={8}
              />
              <button
                name="password"
                type="button"
                onClick={(e) => {
                  if (formData?.password !== formData?.password2) {
                    throw new Error("Passwords must match");
                  }

                  if (formData?.password.length < 8) {
                    throw new Error("Password must be at least 8 characters");
                  }

                  setPendingChanges((prevState) => ({
                    ...prevState,
                    [e.target.name]: formData[e.target.name],
                  }));

                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                name="password"
                onClick={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    [e.target.name]: "",
                  }));
                  setEditInfo((prevState) => ({
                    ...prevState,
                    [e.target.name]: false,
                  }));
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button type="button" name="password" onClick={handleEdit}>
              Change Password
            </button>
          )}
        </div>

        <div>
          <input
            type="submit"
            onClick={handleSubmit}
            value="Save changes"
            disabled={
              Object.values(pendingChanges).length === 0 ||
              Object.keys(pendingChanges).every(
                (key) => pendingChanges[key] === userDetails[key]
              )
            }
          />
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
            }}
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
