import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice.js";
import { toast } from "react-toastify";

function Login() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;
  const { isError, message } = useSelector((state) => state.auth);

  const handleInput = (e) => {
    e.preventDefault();

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please add all fields");
    } else {
      const userCredentials = {
        email,
        password,
      };

      dispatch(loginUser(userCredentials));
    }
  };

  if (isError) {
    toast.error(message);
  }

  return (
    <div className="container">
      <form id="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Your email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Your email"
          autoComplete="email"
          value={email}
          onChange={handleInput}
        />
        <label htmlFor="password">Your password</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Your password"
          autoComplete="off"
          minLength={8}
          value={password}
          onChange={handleInput}
        />
        <input style={{ marginTop: "1rem" }} type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;
