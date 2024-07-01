import request from "supertest";
import { expect } from "chai";
import express from "express";
import mongoose from "mongoose";
import userRouter from "../../../backend/routes/users/userRoutes.js";
import User from "../../../backend/models/users/userModel.js";
import bcrypt from "bcrypt";

let app;

describe("Router", () => {
  before(async () => {
    app = express();
    app.use(express.json());
    app.use("/api/users", userRouter);
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("User Auth Routes", () => {
    describe("registerUser", () => {
      it("should respond with a 201 status and a message", async () => {
        const user = {
          name: "Joe Roger",
          email: "joeroger@gmail.com",
          password: "martin123",
          password2: "martin123",
        };
        const res = await request(app).post("/api/users/").send(user);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("name", user.name);
        expect(res.body).to.have.property("email", user.email);
        expect(res.body).to.have.property("token");
      });
    });

    describe("loginUser", () => {
      beforeEach(async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("martin123", salt);
        const user = new User({
          name: "Joe Roger",
          email: "joeroger@gmail.com",
          password: hashedPassword,
        });
        await user.save();
      });

      it("should respond with a 200 status and a message", async () => {
        const res = await request(app).post("/api/users/login").send({
          email: "joeroger@gmail.com",
          password: "martin123",
        });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("name", "Joe Roger");
        expect(res.body).to.have.property("email", "joeroger@gmail.com");
        expect(res.body).to.have.property("token");
      });
    });
  });
});
