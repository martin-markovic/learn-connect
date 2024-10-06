const emitRoomEvent = async (data) => {
  const { socketInstance, eventName, roomData } = data;

  if (!socketInstance) {
    console.error("Socket not connected.");
  }

  if (!eventName) {
    console.error("Invalid socket event.");
  }

  if (!roomData) {
    console.error("Room data not found.");
    return;
  }

  try {
    await socketInstance.emit(eventName, { roomData });

    return { success: true };
  } catch (error) {
    console.error(`Error emitting event: ${eventName}`, error.message);
    return { success: false, error: error.message };
  }
};

export default emitRoomEvent;
