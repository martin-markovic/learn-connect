const emitSocketEvent = async (data) => {
  const { socketInstance, eventName, roomNames } = data;

  if (!socketInstance) {
    console.error("Socket not connected.");
  }

  if (!eventName) {
    console.error("Invalid socket event.");
  }

  if (!roomNames) {
    console.error("Room names not found.");
    return;
  }

  try {
    await socketInstance.emit(eventName, { roomNames });
    console.log(`Successfully emitted event: ${eventName}`, { roomNames });

    return { success: true };
  } catch (error) {
    console.error(`Error emitting event: ${eventName}`, error.message);
    return { success: false, error: error.message };
  }
};

export default emitSocketEvent;
