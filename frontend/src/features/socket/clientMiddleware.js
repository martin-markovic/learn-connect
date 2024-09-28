export const validateClientData = (data) => {
  const { socketInstance, token, room } = data;

  if (!socketInstance) {
    return { errorMessage: "Invalid socket" };
  }

  if (!token) {
    return { errorMessage: "Invalid token" };
  }

  if (!room) {
    return { errorMessage: "Room data missing" };
  }

  return { errorMessage: null };
};
