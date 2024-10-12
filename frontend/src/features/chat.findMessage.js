const findMessageIndex = (messages, messageId) => {
  let messageIndex = -1;
  let classroom = null;

  for (let room in messages) {
    messageIndex = messages[room].findIndex((msg) => msg._id === messageId);
    if (messageIndex !== -1) {
      classroom = room;
      break;
    }
  }

  return { messageIndex, classroom };
};

export default findMessageIndex;
