import { findCommonClassroom } from "../../utils/chat/chatUtils.js";
import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";
import jwt from "jsonwebtoken";

const handleSocketConnection = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
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

    socket.on("joinRoom", async (room) => {
      const classroom = await Classroom.findOne({ name: room });
      if (classroom && classroom.students.includes(socket.user._id)) {
        socket.join(room);
        console.log(`User ${socket.user._id} joined room ${room}`);
        io.to(room).emit(
          "message",
          `User ${socket.user._id} joined the classroom`
        );
      } else {
        console.log("Join room failed: user not in classroom");
      }
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      io.to(room).emit("message", `User ${socket.user._id} left room`);
      console.log(`User ${socket.user._id} left room ${room}`);
    });

    socket.on("messageRoom", async ({ room, message }) => {
      const classroom = await Classroom.findById(room);
      if (classroom && classroom.students.includes(socket.user._id)) {
        const newMessage = new Chat({
          sender: socket.user._id,
          classroom: room,
          text: message,
        });

        await newMessage.save();

        io.to(room).emit("message", newMessage);
        console.log(`User ${socket.id} sent message to room ${room}`);
      } else {
        console.log("Message send failed: user not in classroom");
      }
    });

    socket.on("chat message", async (data) => {
      const { friend, message } = data;

      try {
        const { commonClassroom } = await findCommonClassroom(
          socket.user._id,
          friend
        );

        const newMessage = new Chat({
          sender: socket.user._id,
          receiver: friend._id,
          classroom: commonClassroom._id,
          text: message,
        });

        await newMessage.save();

        socket.to(commonClassroom._id.toString()).emit("chat message", {
          friend,
          message: newMessage,
        });
      } catch (error) {
        console.error("Error during message validation:", error);
        socket.emit("error", "An error occurred while sending the message");
      }
    });

    socket.on("chat activity", (name) => {
      socket.broadcast.emit("chat activity", name);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default handleSocketConnection;
