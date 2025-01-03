import validateClientData from "./dataMiddleware.js";

const emitEvent = (clientData) => {
  const { success } = validateClientData(clientData);

  if (!success) {
    console.error("Please provide valid client data");
    return;
  }

  const { socketInstance, eventName, eventData } = clientData;

  socketInstance.emit(eventName, eventData, (ackResult) => {
    console.log("Ack received: ", ackResult);
  });
};

export default emitEvent;
