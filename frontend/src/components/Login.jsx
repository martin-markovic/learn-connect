import { useState } from "react";

function Login() {
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

    const userCredentials = {
      email,
      password,
    };
  };

  return (
    <div className="container">
      <form id="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Your email"
          autoComplete="email"
          onChange={handleInput}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Your password"
          autoComplete="off"
          minLength={8}
          onChange={handleInput}
        />
        <input style={{ marginTop: "1rem" }} type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;
