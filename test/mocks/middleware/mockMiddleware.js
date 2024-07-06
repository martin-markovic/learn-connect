import testDB from "../config/mockDatabase.js";

export const mockProtect = async (req, res, next) => {
  let token;

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({ message: "Not authorized, no token" });
  } else {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decodedToken = token.slice(-1);

      const userFound = testDB.findOne("users", {
        id: parseInt(decodedToken, 10),
      });

      if (!userFound) {
        return res.status(401).json({ message: "User not authorized" });
      }

      req.user = userFound;

      next();
    } catch (error) {
      return res.status(500).json({ message: "Bad request" });
    }
  }
};
