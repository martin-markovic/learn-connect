import request from "supertest";
import { expect } from "chai";
import express from "express";
import userRouter from "../../backend/routes/users/userRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("User Routes", () => {
  describe("POST /api/users/", () => {
    it("should respond with a 200 status and a message", async () => {
      const res = await request(app).post("/api/users/").send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "POST user");
    });
  });

  describe("GET /api/users/", () => {
    it("should respond with a 200 status and a message", async () => {
      const res = await request(app).get("/api/users/").send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "GET user");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should respond with a 200 status and a message", async () => {
      const res = await request(app).put("/api/users/1").send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "PUT user 1");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should respond with a 200 status and a message", async () => {
      const res = await request(app).delete("/api/users/1").send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "DELETE user 1");
    });
  });
});
