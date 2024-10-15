import validateRoomData from "../dataMiddleware.js";

const emitRoomEvent = async (data) => {
  const { socketInstance, eventName, roomData } = data;

  const response = validateRoomData(data);

  if (!response.success) {
    console.error("Room data validation failed: ", response.errorMessage);
    return { success: false, error: response.errorMessage };
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
