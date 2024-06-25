import request from "supertest";
import { expect } from "chai";
import express from "express";
import userRouter from "../../backend/routes/users/userRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("Router", () => {
  describe("User Auth Routes", () => {
    describe("registerUser", () => {
      it("should respond with a 201 status and a message", async () => {
        const user = {
          name: "John Doe",
          email: "johndoe@gmail.com",
          password: "martin123",
          password2: "martin123",
        };
        const res = await request(app).post("/api/users/").send(user);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property(
          "message",
          `User ${user.name} with an email ${user.email} was successfully registered`
        );
      });
    });

    describe("loginUser", () => {
      it("should respond with a 200 status and a message", async () => {
        const res = await request(app).post("/api/users/login").send({
          email: "johndoe@gmail.com",
          password: "martin123",
        });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property(
          "message",
          "User was successfully logged in"
        );
      });
    });
  });
});
