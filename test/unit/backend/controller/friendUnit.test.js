process.env.JWT_SECRET = "test-secret";
import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockRes from "../../../mocks/config/mockRes.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  getFriendList,
  getUserList,
} from "../../../../backend/controller/users/friendController.js";
import { registerUser } from "../../../../backend/controller/users/userController.js";

const MockUserModel = new MockModel("users");
const MockFriendModel = new MockModel("friends");
const UserData = new MockData();
const friendRes = new MockRes();

const mockRegisterUser = registerUser(MockUserModel);
const mockGetFriendList = getFriendList(MockFriendModel);
const mockGetUserList = getUserList(MockFriendModel, MockUserModel);

const senderDoc = { ...UserData.mockUsers[0] };
const receiverDoc = { ...UserData.mockUsers[1] };
const mutualFriendDoc = { ...UserData.mockUsers[2] };

describe("Friend API", () => {
  before(async () => {
    await mockRegisterUser({ body: senderDoc }, friendRes);
    await mockRegisterUser({ body: receiverDoc }, friendRes);

    MockFriendModel.create({
      _id: "1",
      sender: { _id: "0", name: senderDoc.name },
      receiver: { _id: "1", name: receiverDoc.name },
      status: "accepted",
    });

    MockFriendModel.create({
      _id: "2",
      sender: { _id: "0", name: senderDoc.name },
      receiver: { _id: "2", name: mutualFriendDoc.name },
      status: "accepted",
    });
  });

  beforeEach(() => {
    friendRes.reset();
  });

  after(() => {
    MockUserModel.cleanupAll();
    MockFriendModel.cleanupAll();
  });

  describe("getFriendList", () => {
    it("should fetch a friend list for sender and verify it", async () => {
      const mockReq = { params: { userId: "0" }, user: { _id: "0" } };

      await mockGetFriendList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(200);

      expect(friendRes.body).to.be.an("array");
      expect(friendRes.body.length).to.equal(2);
      expect(friendRes.body[0].receiver.name).to.equal(receiverDoc.name);
      expect(friendRes.body[0].sender.name).to.equal(senderDoc.name);
    });

    it("should fetch a friend list for receiver and verify it", async () => {
      const mockReq = { params: { userId: "1" }, user: { _id: "1" } };

      await mockGetFriendList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(200);

      expect(friendRes.body).to.be.an("array");
      expect(friendRes.body.length).to.equal(2);
      expect(friendRes.body[0].receiver.name).to.equal(receiverDoc.name);
      expect(friendRes.body[0].sender.name).to.equal(senderDoc.name);
    });

    it("should fetch a friend list for mutual friend and verify it", async () => {
      const mockReq = { params: { userId: "0" }, user: { _id: "2" } };

      await mockGetFriendList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(200);

      expect(friendRes.body).to.be.an("array");
      expect(friendRes.body.length).to.equal(2);
      expect(friendRes.body[1].sender.name).to.equal(senderDoc.name);
      expect(friendRes.body[1].receiver.name).to.equal(mutualFriendDoc.name);
    });

    it("should return `User id is required` error message", async () => {
      const mockReq = { params: { userId: undefined }, user: { _id: "1" } };

      await mockGetFriendList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(403);

      expect(friendRes.body.message).to.equal("User id is required");
    });

    it("should return `User is not authenticated` error message", async () => {
      const mockReq = { params: { userId: "0" }, user: { _id: undefined } };

      await mockGetFriendList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(401);

      expect(friendRes.body.message).to.equal("User is not authenticated");
    });
  });

  describe("getUserList", () => {
    it("should fetch a userlist for sender and verify it", async () => {
      const mockReq = { user: { _id: senderDoc } };

      await mockGetUserList(mockReq, friendRes);

      expect(friendRes.statusCode).to.equal(200);
      expect(friendRes.body.length).to.equal(2);
      expect(friendRes.body[0].name).to.equal(senderDoc.name);
      expect(friendRes.body[1].name).to.equal(receiverDoc.name);
    });
});
