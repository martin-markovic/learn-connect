process.env.JWT_SECRET = "test-secret";
import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockRes from "../../../mocks/config/mockRes.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  registerUser,
  loginUser,
  updateUser,
} from "../../../../backend/controller/users/userController.js";

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
    await mockRegisterUser({ body: { ...UserData.mockUsers[0] } }, userRes);
    existingUser = MockUserModel.storage.users[0];
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

  describe("loginUser", () => {
    it("should login a user and verify it", async () => {
      const mockReq = {
        body: { email: newUser.email, password: newUser.password },
      };

      await mockLoginUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(200);

      expect(userRes.body.name).to.equal(newUser.name);
      expect(userRes.body.email).to.equal(newUser.email);
      expect(userRes.body).to.have.property("_id");
      expect(userRes.body).to.have.property("token");
    });

    it("should return `Both email and password are required to log in` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.email = undefined;

      const mockReq = { body: invalidUser };

      await mockLoginUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(400);

      expect(userRes.body.message).to.equal(
        "Both email and password are required to log in"
      );
    });

    it("should return `User not registered` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.email = "invaliduser@gmail.com";

      const mockReq = { body: invalidUser };

      await mockLoginUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(404);

      expect(userRes.body.message).to.equal("User not registered");
    });

    it("should return `Invalid password` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser.password = newUser.password + "0";

      const mockReq = { body: invalidUser };

      await mockLoginUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(400);

      expect(userRes.body.message).to.equal("Invalid password");
    });
  });

  describe("updateUser", () => {
    it("should update user data and verify it", async () => {
      const updatedName = "Ben Cage";
      const mockReq = {
        body: {
          name: updatedName,
        },
        user: { _id: UserData.mockUsers[0]._id },
      };

      await mockUpdateUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(200);

      expect(userRes.body.name).to.equal(updatedName);
      expect(userRes.body.email).to.equal(existingUser.email);
      expect(userRes.body._id).to.equal(existingUser._id);
    });

    it("should update user avatar and verify it", async () => {
      const updatedAvatar = "newAvatar.png";
      const mockReq = {
        file: { path: updatedAvatar },
        user: { _id: existingUser._id },
        body: {},
      };

      await mockUpdateUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(200);
      expect(userRes.body._id).to.equal(existingUser._id);
      expect(userRes.body.email).to.equal(existingUser.email);
      expect(userRes.body.avatar).to.equal(updatedAvatar);
    });

    it("should return `Authentication required` error message", async () => {
      const invalidUser = { ...newUser };
      invalidUser._id = undefined;

      const mockReq = { body: invalidUser };

      await mockUpdateUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(403);

      expect(userRes.body.message).to.equal("Authentication required");
    });

    it("should return `Email already in use` error message", async () => {
      const updatedEmail = "johndoe@gmail.com";

      const mockReq = {
        body: { email: updatedEmail },
        user: { _id: MockUserModel.storage.users[1]._id },
      };

      await mockUpdateUser(mockReq, userRes);

      expect(userRes.statusCode).to.equal(409);

      expect(userRes.body.message).to.equal("Email already in use");
    });
  });
});
