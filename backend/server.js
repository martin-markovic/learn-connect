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

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});

import configureSocket from "./config/socketIo.js";
import handleSocketConnection from "./controller/chat/socketController.js";

const ioServer = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8000",
    ],
    credentials: true,
  },
});

configureSocket(ioServer);
handleSocketConnection(ioServer);

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
