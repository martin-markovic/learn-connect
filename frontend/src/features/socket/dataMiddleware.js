const validateClientData = (clientData) => {
  const { socketInstance, eventName, eventData } = clientData;
  let errorMessage = null;
  let success = true;

  if (!socketInstance) {
    errorMessage = "Socket not connected.";
    console.error(errorMessage);
    success = false;
    return { errorMessage, success };
  }

  if (!eventName) {
    errorMessage = "Invalid socket event.";
    console.error(errorMessage);
    success = false;
    return { errorMessage, success };
  }

  if (!eventData) {
    errorMessage = "Room data not found.";
    console.error(errorMessage);
    return { errorMessage, success };
  }

  const allowedKeys = ["socketInstance", "eventName", "eventData"];
  const unexpectedKeys = Object.keys(clientData).filter(
    (key) => !allowedKeys.includes(key)
  );

  if (unexpectedKeys.length > 0) {
    errorMessage = "Unexpected data found";
    console.error(errorMessage);
    success = false;
    return { errorMessage, success };
  }

  return { errorMessage, success };
};

export default validateClientData;
