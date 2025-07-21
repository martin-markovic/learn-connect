import request from "supertest";
import { expect } from "chai";
import express from "express";
import mongoose from "mongoose";
import userRouter from "../../../backend/routes/users/userRoutes.js";
import quizRoutes from "../../../backend/routes/quizzes/quizRoutes.js";
import User from "../../../backend/models/users/userModel.js";

let app;
let newUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
  password2: "password123",
};

describe("Router", () => {
  before(async () => {
    app = express();
    app.use(express.json());
    app.use("/api/users", userRouter);
    app.use("/api/quizzes/", quizRoutes);
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DATABASE_NAME,
      });
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
  });

  describe("Successfull API handlers", () => {
    it("register new user and verify it", async () => {
      const res = await request(app).post("/api/users/").send(newUser);

      expect(res.status).to.equal(201);
    });

    it("should login a user and verify it", async () => {
      await request(app).post("/api/users/").send(newUser);

      const res = await request(app).post("/api/users/login").send({
        email: newUser.email,
        password: newUser.password,
      });

      expect(res.status).to.equal(200);
    });
  });

  describe("Error API handlers", () => {
    it("should return status 400", async () => {
      const res = await request(app).post("/api/users/").send({
        name: newUser.name,
        password: newUser.password,
        password2: newUser.password2,
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Please add all fields");
    });

    it("should return status 400", async () => {
      const res = await request(app).post("/api/users/").send({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        password2: "pasword12",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Passwords must match");
    });

    it("should return status 400", async () => {
      await request(app).post("/api/users/").send(newUser);
      const res = await request(app).post("/api/users/").send(newUser);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "User already registered");
    });

    it("should return status 400", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: newUser.email,
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Please add all fields");
    });

    it("should return status 400", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: newUser.email,
        password: "123456",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Invalid credentials");
    });
  });
});
