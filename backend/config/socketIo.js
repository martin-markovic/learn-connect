import jwt from "jsonwebtoken";

const configureSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { _id: decodedToken.id };
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected with ID: ${socket.user._id}`);
  });

  io.on("connection_error", (err) => {
    console.error("Connection Error:", err.message);
  });

  io.on("error", (err) => {
    console.error("Socket.IO error:", err);
  });

  io.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
};

export default configureSocket;
