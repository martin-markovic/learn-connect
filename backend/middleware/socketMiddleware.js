import jwt from "jsonwebtoken";

const socketMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("Token is missing from handshake auth");
    return next(new Error("Authentication error: Token is missing"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = { id: decodedToken.id };
    console.log("Socket user set:", socket.user);

    next();
  } catch (error) {
    console.log("Invalid token:", error.message);
    return next(new Error(`Authentication error: ${error.message}`));
  }
};

export default socketMiddleware;
