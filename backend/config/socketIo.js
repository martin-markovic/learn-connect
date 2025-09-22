import socketMiddleware from "../middleware/socketMiddleware.js";
import handleSocketLifeCycle from "../controller/socket/managers/manageSocketLifecycle.js";

const configureSocket = (io) => {
  try {
    io.use(socketMiddleware);

    handleSocketLifeCycle(io);
  } catch (error) {
    console.error(
      "Error configuring socket connection: ",
      error.message || "Server error"
    );
  }
};

export default configureSocket;
