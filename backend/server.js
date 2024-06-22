import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import router from "./routes/router.js";

const PORT = process.env.SERVER_PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});
