import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.SERVER_PORT || 8000;

const app = express();

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8000",
    ],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import connectDB from "./config/db.js";

connectDB();

import router from "./routes/router.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));

app.use("/", router);

app.get("/js/main.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");

  res.sendFile(path.join(__dirname, "public", "js", "main.js"));
});

io.on("connection", (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  socket.on("chat message", (data) => {
    const { friend, message } = data;
    socket.broadcast.emit("chat message", { friend, message });
  });

  socket.on("chat activity", (name) => {
    socket.broadcast.emit("chat activity", name);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export { expressServer, io, PORT };
