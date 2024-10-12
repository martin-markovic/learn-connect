const validateRoomData = (data) => {
  const { socketInstance, eventName, roomData } = data;
  let errorMessage = null;
  let success = true;

  if (!socketInstance) {
    errorMessage = "Socket not connected.";
    success = false;
    return { errorMessage, success };
  }

  if (!eventName) {
    errorMessage = "Invalid socket event.";
    success = false;
    return { errorMessage, success };
  }

  if (!roomData) {
    errorMessage = "Room data not found.";
    return { errorMessage, success };
  }

  const allowedKeys = ["socketInstance", "eventName", "roomData"];
  const unexpectedKeys = Object.keys(data).filter(
    (key) => !allowedKeys.includes(key)
  );

  if (unexpectedKeys.length > 0) {
    errorMessage = "Unexpected data found";
    success = false;
    return { errorMessage, success };
  }

  return { errorMessage, success };
};

export default validateRoomData;
