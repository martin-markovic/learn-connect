import Classroom from "../../models/classrooms/classroomModel.js";

const handleRoomEvents = (socket, io) => {
  socket.on("join room", async (data) => {
    const { rooms } = data;

    for (const room in rooms) {
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
    }
  });

  socket.on("join user rooms", (rooms) => {
    co;

    roomNames.forEach((room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.emit("rooms joined", rooms);
  });

  socket.on("leave room", (data) => {
    const { rooms } = data;

    for (const room in rooms) {
      socket.leave(room);
      io.to(room).emit("message", `User ${socket.user._id} left the room`);
      console.log(`User ${socket.user._id} left room ${room}`);
    }
  });
};

export default handleRoomEvents;
