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
    MockUserModel.cleanupAll();
  });

  describe("registerUser", () => {
    it("should register a user and verify it", async () => {
      const mockReq = { body: { ...newUser } };

      await mockRegisterUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(201);

      expect(userRes.body.name).to.equal(newUser.name);
      expect(userRes.body.email).to.equal(newUser.email);
      expect(userRes.body).to.have.property("_id");
      expect(userRes.body).to.have.property("token");
    });

    it("should return `Please add all fields` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.name = undefined;
      const mockReq = { body: invalidUser };

      await mockRegisterUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(400);

      expect(userRes.body.message).to.equal("Please add all fields");
    });

    it("should return `Passwords must match` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.password = newUser.password + "0";
      const mockReq = { body: invalidUser };

      await mockRegisterUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(400);

      expect(userRes.body.message).to.equal("Passwords must match");
    });

    it("should return `Email already registered` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.email = UserData.mockUsers[0].email;

      const mockReq = { body: invalidUser };

      await mockRegisterUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(400);

      expect(userRes.body.message).to.equal("Email already registered");
    });
  });
});
