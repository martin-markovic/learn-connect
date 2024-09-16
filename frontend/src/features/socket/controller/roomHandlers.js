import { validateClientData } from "../clientMiddleware.js";

export const handleJoinRoom = async (data) => {
  const isValidData = validateClientData(data);

  if (!isValidData) {
    console.error("Please provide valid user data");
    return;
  }

  try {
    const { socketInstance, user, room } = data;

    const roomData = { user, room };

    await socketInstance.emit("join room", roomData);
    console.log("Successfully joined room via socket");
  } catch (error) {
    console.error("Failed to join room via socket:", error);
  }
};

export const handleLeaveRoom = async (data) => {
  const isValidData = validateClientData(data);

  if (!isValidData) {
    console.error("Please provide valid user data");
    return;
  }

  try {
    const { socketInstance, user, room } = data;

    const roomData = {
      user,
      room,
    };

    await socketInstance.emit("leave room", roomData);
    console.log("Successfully left the socket room.");
  } catch (error) {
    console.error("Failed to leave the room via socket:", error);
  }
};
