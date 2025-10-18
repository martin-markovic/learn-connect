import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import configureSocket from "./config/socketIo.js";
import router from "./routes/router.js";

dotenv.config();

const PORT = process.env.SERVER_PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
  ],
  methods: ["GET", "POST"],
  credentials: true,
  transports: ["websocket"],
};

const socketOptions = {
  cors: { ...corsOptions, transports: ["websocket"] },
};

const app = express();

const configureMiddleware = (app) => {
  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static(path.join(__dirname, "public")));

  app.use((req, res, next) => {
    next();
  });
};

const configureErrorHandling = (app) => {
  app.use((err, req, res, next) => {
    console.error("Global error handler:", err.stack || err.message);

    return res.status(err.status || 500).json({
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
};

const initializeServer = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    configureMiddleware(app);

    app.use("/", router);

    configureErrorHandling(app);

    const expressServer = app.listen(PORT, () => {
      console.log(`Server is running...go to http://localhost:${PORT}`);
    });

    console.log("Initializing Socket.IO server...");
    const ioServer = new Server(expressServer, socketOptions);

    configureSocket(ioServer);
    console.log("✅ Socket.IO server initialized");

    return { expressServer, ioServer, PORT };
  } catch (error) {
    console.error("❌ Failed to initialize server:", error.message);
    process.exit(1);
  }
};

const { expressServer, ioServer } = await initializeServer();

export { expressServer, ioServer, PORT };
