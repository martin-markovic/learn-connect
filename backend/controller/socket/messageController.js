import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

const handleMessages = (socket, io) => {
  socket.on("message room", async ({ room, message }) => {
    const classroom = await Classroom.findById(room);
    if (classroom && classroom.students.includes(socket.user._id)) {
      const newMessage = new Chat({
        sender: socket.user._id,
        classroom: room,
        text: message,
      });

      await newMessage.save();

      io.to(room).emit("message", newMessage);
    } else {
      console.log("Message send failed: user not in classroom");
    }
  });

  socket.on("user typing", (data) => {
    const { room, senderId, senderName } = data;

    console.log("User is in rooms: ", socket.rooms);

    socket.broadcast.to(room).emit("chat activity", {
      senderId,
      senderName,
    });
  });
};

export default handleMessages;
