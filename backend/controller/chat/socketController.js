import { findCommonClassroom } from "../../utils/chat/chatUtils.js";
import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

const handleSocketConnection = (server) => {
  server.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    socket.on("joinRoom", async (room) => {
      const classroom = await Classroom.findById(room);
      if (classroom && classroom.students.includes(socket.user._id)) {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        io.to(room).emit("message", `User ${socket.id} joined the classroom`);
      } else {
        console.log("Join room failed: user not in classroom");
      }
    });

    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      io.to(room).emit("message", `User ${socket.id} left room`);
      console.log(`User ${socket.id} left room ${room}`);
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

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default handleSocketConnection;
