import emitEvent from "../socket.emitEvent.js";

const handleSocialEvent = (clientData) => {
  const { socketInstance } = clientData;

  if (!socketInstance) {
    console.error("Please provide valid socket instance");
    return;
  }

  const ok = emitEvent(clientData);

  return ok;
};

export default handleSocialEvent;
