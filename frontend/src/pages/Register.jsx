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
  });

  const { name, email, password, password2 } = formData;

  const { isError, message } = useSelector((state) => state.auth);

  if (isError) {
    toast.error(message);
  }

  const handleInput = (e) => {
    e.preventDefault();

    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (password !== password2) {
        throw new Error("Passwords do not match");
      }
      const userCredentials = {
        name,
        email,
        password,
        password2,
      };

      dispatch(registerUser(userCredentials));
    } catch (error) {
      console.error("Error submitting user credentials: ", error.message);
      toast.error("Error submitting user credentials: ", error.message);
    }
  };

  return (
    <div className="container">
      <form
        id="register-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="auth-form-input_group">
          <label>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={handleInput}
          />
        </div>
        <div className="auth-form-input_group">
          <label>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Your email"
            autoComplete="email"
            value={email}
            onChange={handleInput}
          />
        </div>
        <div className="auth-form-input_group">
          <label>Password</label>
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
        </div>
        <div className="auth-form-input_group">
          <label>Confirm Password</label>
          <input
            type="password"
            id="password2"
            name="password2"
            placeholder="Confirm password"
            autoComplete="off"
            minLength={8}
            value={password2}
            onChange={handleInput}
          />{" "}
        </div>
        <input style={{ marginTop: "1rem" }} type="submit" value="Register" />
      </form>
    </div>
  );
}

export default Register;
