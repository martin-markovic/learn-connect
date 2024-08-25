import { findCommonClassroom } from "../../utils/chat/chatUtils.js";

const handleMessages = (socket, io) => {
  socket.on("message friend", async (data) => {
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
      console.log(`User ${socket.id} sent message to room ${room}`);
    } else {
      console.log("Message send failed: user not in classroom");
    }
  });

  socket.on("chat activity", (receiver) => {
    const name = socket.user.name.split(" ")[0];

    if (typeof receiver === "object" && receiver._id) {
      const friendSocketId = receiver.socketId;

      if (friendSocketId) {
        socket.to(friendSocketId).emit("chat activity", {
          name,
        });
      }
    } else if (typeof receiver === "string") {
      socket.to(receiver).emit("chat activity", name);
    } else {
      console.error("Invalid receiver format");
    }
  });
};

export default handleMessages;
