import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";

const PORT = process.env.SERVER_PORT || 8000;
connectDB();

import router from "./routes/router.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

io.on("connection", (socket) => {
  console.log(`a user connected to socket: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});

export { server, io, PORT };
