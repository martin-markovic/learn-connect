import Chat from "../../models/chat/chatModel.js";
import Classroom from "../../models/classrooms/classroomModel.js";

const handleMessages = (socket, io) => {
  socket.on("message room", async (data) => {
    const roomData = data.roomData;

    const { sender, text, classroom } = roomData;


    const userClassroom = await Classroom.findOne({ _id: classroom });

    if (!userClassroom) {
      socket.emit("error", { message: "Classroom not found" });
      return;
    }

    const isMember = userClassroom.students.includes(sender?.id);
    if (!isMember) {
      socket.emit("error", {
        message: "You are not a member of this classroom",
      });

      return;
    }

    const newMessage = new Chat({
      classroom,
      sender,
      text,
      status: "delivered",
    });

    const savedMessage = await newMessage.save();

    await Classroom.findByIdAndUpdate(
      classroom,
      { $push: { chats: savedMessage._id } },
      { new: true }
    );

    // io.to(classroom).emit("message delivered", savedMessage);

    io.emit("message delivered", savedMessage);

    socket.broadcast.to(classroom).emit("message delivered", savedMessage);
  });

  socket.on("user typing", (data) => {
    const { roomNames, senderName } = data.roomData;

    socket.broadcast.to(roomNames).emit("chat activity", {
      senderName,
    });
  });

  socket.on("open conversation", async (data) => {
    const { classroomId, messageId } = data.roomData;

    if (!classroomId || !messageId) {
      socket.emit("error", { message: "Missing classroomId or messageId" });
    }

    const message = await Chat.findByIdAndUpdate(
      messageId,
      { status: "seen" },
      { new: true }
    );
    if (!message) {
      socket.emit("error", {
        message: "Message not found",
      });

      return;
    }

    socket.emit("message seen", messageId);
  });
};

export default handleMessages;
