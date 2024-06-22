// POST users api/users/

export const registerUser = (req, res) => {
  res.status(200).json({ message: "POST user" });
};

// GET user  api/users/

export const getUsers = (req, res) => {
  res.status(200).json({ message: "GET user" });
};

// PUT user api/users/:id

export const updateUser = (req, res) => {
  res.status(200).json({ message: `UPDATE user ${req.params.id}` });
};

// DELETE user api/users/:id

export const deleteUser = (req, res) => {
  res.status(200).json({ message: `DELETE user ${req.params.id}` });
};
