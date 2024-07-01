import express from "express";

function createMockServer() {
  const app = express();
  app.use(express.json());

  const PORT = process.env.test.PORT || 4000;
  app.use(tokenMiddleware);

  app.use("/", router);

  app.listen(PORT, () => {
    console.log(`Tests running on ${PORT}`);
  });

  return app;
}

module.exports = createMockServer;
