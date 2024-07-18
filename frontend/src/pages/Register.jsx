import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    // avatar: null,
  });

  const {
    name,
    email,
    password,
    password2,
    // avatar
  } = formData;

  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    } else if (isSuccess) {
      navigate("/");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleInput = (e) => {
    e.preventDefault();

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
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
        // avatar,
      };

      dispatch(registerUser(userCredentials));
    }
  };

  return (
    <div className="container">
      <form id="register-form" onSubmit={handleSubmit}>
        {/* <label htmlFor="avatar" onClick={(e) => e.preventDefault()}>
          Choose a profile picture
        </label>
        <input
        type="file"
          id="avatar"
          name="avatar"
          accept="image/png, image/jpeg"
          autoComplete="off"
          onChange={handleInput}
        /> */}
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
