import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/auth/authSlice.js";
import { toast } from "react-toastify";

function Login() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

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
      toast.error("Please provide both fields");
    } else {
      const userCredentials = {
        email,
        password,
      };

      dispatch(loginUser(userCredentials));
    }
  };

  return (
    <div className="container">
      <form id="login-form" onSubmit={handleSubmit}>
        <div className="auth-form-input_group">
          <label>Email: </label>
          <input
            className="auth-input"
            type="email"
            name="email"
            id="email"
            placeholder="Your email"
            autoComplete="email"
            value={email}
            onChange={handleInput}
          />
        </div>
        <div className="auth-form-input_group">
          <label>Password: </label>
          <input
            className="auth-input"
            type="password"
            name="password"
            id="password"
            placeholder="Your password"
            autoComplete="off"
            minLength={8}
            value={password}
            onChange={handleInput}
          />
        </div>
        <input style={{ marginTop: "1rem" }} type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;
