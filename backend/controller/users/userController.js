// POST users api/users/
export const registerUser = async (req, res) => {
  const { name, email, password, password2 } = req.body;

  if (!name || !email || !password || !password2) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  if (password !== password2) {
    return res.status(400).json({ message: "Passwords must match" });
  }

  // const user = await User.findOne(email);

  // if (!user) {
  //   return res.status(201).json({
  //     message: `User ${name} with an email ${email} was successfully registered`,
  //   });
  // }

  // return res.status(400).json({ message: "User already registered" });

  return res.status(201).json({
    message: `User ${name} with an email ${email} was successfully registered`,
  });
};

// POST user api/users/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Please add all fields" });
  }

  res.status(200).json({
    message: "User was successfully logged in",
  });
};
