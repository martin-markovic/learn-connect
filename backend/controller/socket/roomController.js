import Classroom from "../../models/classrooms/classroomModel.js";

const handleRoomEvents = (socket, io) => {
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
};

export default handleRoomEvents;
