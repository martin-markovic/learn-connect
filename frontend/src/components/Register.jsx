import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    avatar: null,
  });

  const { name, email, password, password2, avatar } = formData;

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
      name,
      email,
      password,
      password2,
      avatar,
    };

    console.log(userCredentials);
  };

  return (
    <div className="container">
      <form id="register-form" onSubmit={handleSubmit}>
        <label htmlFor="avatar" onClick={(e) => e.preventDefault()}>
          Choose a profile picture
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png, image/jpeg"
          autoComplete="off"
          onChange={handleInput}
        />
        <input
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          onChange={handleInput}
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          autoComplete="email"
          onChange={handleInput}
        />
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Your password"
          autoComplete="off"
          minLength={8}
          onChange={handleInput}
        />
        <input
          type="password"
          name="password2"
          placeholder="Confirm your password"
          autoComplete="off"
          minLength={8}
          onChange={handleInput}
        />
        <input style={{ marginTop: "1rem" }} type="submit" value="Register" />
      </form>
    </div>
  );
}

export default Register;
