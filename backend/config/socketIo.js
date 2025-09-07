import socketMiddleware from "../middleware/socketMiddleware.js";
import handleSocketLifeCycle from "../controller/socket/managers/manageSocketLifecycle.js";

const configureSocket = (io) => {
  io.use(socketMiddleware);

  handleSocketLifeCycle(io);
};

export default configureSocket;
