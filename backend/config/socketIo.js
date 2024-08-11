import jwt from "jsonwebtoken";

const configureSocket = (server) => {
  server.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return next(new Error("Authentication error: Invalid token"));
      socket.user = user;
      next();
    });
  });
};

export default configureSocket;
