// POST users api/users/
export const registerUser = (req, res) => {
  res.status(201).json({
    message: `User ${req.body.name} with an email ${req.body.email} was successfully registered`,
  });
};

// POST user api/users/login
export const loginUser = (req, res) => {
  res.status(200).json({
    message: "User was successfully logged in",
  });
};
