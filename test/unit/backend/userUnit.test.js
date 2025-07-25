process.env.JWT_SECRET = "test-secret";
import { expect } from "chai";
import MockModel from "../../mocks/config/mockModel.js";
import MockRes from "../../mocks/config/mockRes.js";
import MockData from "../../mocks/config/mockData.js";
import {
  registerUser,
  loginUser,
  updateUser,
} from "../../../backend/controller/users/userController.js";

let newUser = {
  name: "Jack Hearts",
  email: "jackhearts@gmail.com",
  password: "password123",
  password2: "password123",
  avatar: "userAvatar.png",
};

const MockUserModel = new MockModel("users");
const UserData = new MockData();
const userRes = new MockRes();

const mockRegisterUser = registerUser(MockUserModel);
const mockLoginUser = loginUser(MockUserModel);
const mockUpdateUser = updateUser(MockUserModel);

let existingUser;

describe("User API", () => {
  before(async () => {
    existingUser = await mockRegisterUser(
      { body: { ...UserData.mockUsers[0] } },
      userRes
    );
  });

  beforeEach(() => {
    userRes.reset();
  });

  after(() => {
    server.close(() => {
      console.log("Test server stopped");
    });
  });

  describe("registerUser", () => {
    it("should register a user and verify it", async () => {
      const res = await request(app).post("/api/users/").send(newUser);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id", newUser.id);
      expect(res.body).to.have.property("name", newUser.name);
      expect(res.body).to.have.property("email", newUser.email);
      expect(res.body).to.have.property("token", newUser.token);
    });

    it("should return status 400 and a message please add all fields", async () => {
      const res = await request(app).post("/api/users/").send({
        email: newUser.email,
        password: newUser.password,
        password2: newUser.password2,
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Please add all fields");
    });

    it("should return status 400 and a message user already registered", async () => {
      const res = await request(app).post("/api/users/").send(existingUser);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "User already registered");
    });
  });

  describe("loginUser", () => {
    it("should login a user and verify it", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: existingUser.email,
        password: existingUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("id", existingUser.id);
      expect(res.body).to.have.property("name", existingUser.name);
      expect(res.body).to.have.property("email", existingUser.email);
      expect(res.body).to.have.property("token", existingUser.token);
    });

    it("should return status 400 and a message please add all fields", async () => {
      const res = await request(app).post("/api/users/login").send({
        name: existingUser.name,
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Please add all fields");
    });

    it("should return status 404 and a message user not found", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: newUser.email,
        password: newUser.password,
      });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message", "User not found");
    });
  });
});
