import testDB from "../config/mockDatabase.js";

const mockRegisterUser = (req, res) => {
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.password2 ||
    req.body.password !== req.body.password2
  ) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const userExists = testDB.findOne("users", { email: req.body.email });

  if (userExists) {
    return res.status(400).json({ message: "User already registered" });
  }

  const newUser = {
    id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    token: req.body.token,
  };

  return res.status(201).json(newUser);
};
const mockLoginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const userExists = testDB.findOne("users", { email: req.body.email });

  if (!userExists) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    id: userExists.id,
    name: userExists.name,
    email: userExists.email,
    token: userExists.token,
  });
};

export { mockRegisterUser, mockLoginUser };
