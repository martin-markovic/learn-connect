const validateRoomData = (data) => {
  const { socketInstance, eventName, roomData } = data;
  let errorMessage = null;

  if (!socketInstance) {
    errorMessage = "Socket not connected.";
  }

  if (!eventName) {
    errorMessage = "Invalid socket event.";
  }

  if (!roomData) {
    errorMessage = "Room data not found.";
  }

  const response = {
    errorMessage,
    success: false,
  };

  return response;
};

export default validateRoomData;
