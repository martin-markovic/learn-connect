import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.SERVER_PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log(`Server is running...go to http://localhost:${PORT}`);
});
