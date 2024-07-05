import express from "express";

function createMockServer() {
  const app = express();

  app.use(express.json());

  return app;
}

export default createMockServer;
