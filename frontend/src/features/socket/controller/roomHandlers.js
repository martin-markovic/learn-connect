import { validateClientData } from "../clientMiddleware.js";

export const handleRoomJoin = async (roomNames) => {
  if (!roomNames) {
    console.error("Room names not found.");
    return;
  }

  try {
    console.log("roomHandlers data:", { roomNames });

    await socketInstance.emit("join room", { roomNames });
    console.log("Successfully joined the socket rooms.");
  } catch (error) {
    console.error("Failed to join the socket room:", error);
  }
};

export const handleRoomLeave = async (data) => {
  if (!roomNames) {
    console.error("Room names not found.");
    return;
  }

  try {
    await socketInstance.emit("leave room", { roomNames });
    console.log("Successfully left the socket rooms.");
  } catch (error) {
    console.error("Failed to leave the socket rooms:", error);
  }
};
