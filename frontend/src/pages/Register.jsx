import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { toast } from "react-toastify";

function Register() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    avatar: null,
  });

  const { name, email, password, password2, avatar } = formData;

  const { isError, message } = useSelector((state) => state.auth);

  const DEFAULT_AVATAR =
    "https://res.cloudinary.com/dsgq6lvjq/image/upload/v1743887444/user-2517433_sum4yo.svg";

  if (isError) {
    toast.error(message);
  }

  const handleInput = (e) => {
    e.preventDefault();

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]:
        e.target.name === "avatar" ? e.target.files[0] : e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("Passwords do not match");
    } else {
      const userCredentials = {
        name,
        email,
        password,
        password2,
        avatar,
      };

      dispatch(registerUser(userCredentials));
    }
  };

  return (
    <div className="container">
      <form
        id="register-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="avatar">
          <span className="avatar-input">
            <label htmlFor="avatar" onClick={(e) => e.preventDefault()}>
              Add a profile picture
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/png, image/jpeg"
              autoComplete="off"
              onChange={handleInput}
            />
          </span>
          <span>
            <img
              src={
                avatar instanceof File
                  ? URL.createObjectURL(avatar)
                  : DEFAULT_AVATAR
              }
              alt="User avatar"
              width="64"
              height="64"
            />
          </span>
        </div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={handleInput}
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your email"
          autoComplete="email"
          value={email}
          onChange={handleInput}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Your password"
          autoComplete="off"
          minLength={8}
          value={password}
          onChange={handleInput}
        />
        <label htmlFor="password2">Confirm Password</label>
        <input
          type="password"
          id="password2"
          name="password2"
          placeholder="Confirm your password"
          autoComplete="off"
          minLength={8}
          value={password2}
          onChange={handleInput}
        />
        <input style={{ marginTop: "1rem" }} type="submit" value="Register" />
      </form>
    </div>
  );
}

export default Register;
