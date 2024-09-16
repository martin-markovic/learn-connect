export const validateClientData = (data) => {
  const { socketInstance, token, room } = data;

  if (!socketInstance) {
    console.error("Invalid socket");
    return false;
  }

  if (!token) {
    console.error("Invalid token");
    return false;
  }

  if (!room) {
    console.error("Room data missing");
    return false;
  }
  return true;
};
