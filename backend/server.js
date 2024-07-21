import express from "express";
import { Server } from "socket.io";
import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import path from "path";
import fs from "fs";
import { getAnalytics } from "firebase/analytics";
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

const io = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:8000",
    ],
    credentials: true,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/db.js";

connectDB();

import router from "./routes/router.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const serviceAccountPath = path.resolve(
  __dirname,
  "./config/serviceAccountKey.json"
);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebaseConfig = {
  apiKey: "AIzaSyDlyc0oRPpBs5JQzlH_C1dpVoOrogHQ7I4",
  authDomain: "martin-portfolio-app.firebaseapp.com",
  projectId: "martin-portfolio-app",
  storageBucket: "martin-portfolio-app.appspot.com",
  messagingSenderId: "781194994635",
  appId: "1:781194994635:web:fc3018007738f3b5e50c4e",
  measurementId: "G-0BR6BZJCPF",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

app.use("/", router);

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

export { expressServer, io, PORT, admin, auth };
