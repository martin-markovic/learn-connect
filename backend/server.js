import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.SERVER_PORT || 8000;

const app = express();

import cors from "cors";
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack || err.message);
  res.status(err.status || 500).json({ message: err.message });
});

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});

import configureSocket from "./config/socketIo.js";
import manageSocketEvents from "./controller/socket/socketController.js";

const ioServer = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket"],
  },
});

configureSocket(ioServer);
manageSocketEvents(ioServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/db.js";

connectDB();

import router from "./routes/router.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", router);

export { expressServer, ioServer, PORT };
