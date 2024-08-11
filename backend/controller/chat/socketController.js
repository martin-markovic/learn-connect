import { findCommonClassroom } from "../../utils/chat/chatUtils.js";

const handleSocketConnection = (server) => {
  server.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      io.to(room).emit("message", `User ${socket.id} left room`);
      console.log(`User ${socket.id} left room ${room}`);
    });

    socket.on("messageRoom", ({ room, message }) => {
      io.to(room).emit("message", message);
      console.log(
        `User ${socket.id} sent message to a room ${room}: ${message}`
      );
    });

    socket.on("chat message", async (data) => {
      const { friend, message } = data;

      try {
        const { commonClassroom } = await findCommonClassroom(
          socket.user._id,
          friend
        );

        socket.to(commonClassroom._id.toString()).emit("chat message", {
          friend,
          message,
        });
      } catch (error) {
        console.error("Error during message validation:", error);
        socket.emit("error", "An error occurred while sending the message");
      }
    });

    socket.on("chat activity", (name) => {
      socket.broadcast.emit("chat activity", name);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default handleSocketConnection;
