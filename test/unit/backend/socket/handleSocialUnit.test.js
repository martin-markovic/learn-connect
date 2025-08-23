import { expect } from "chai";
import {
  handleNewRequest,
} from "../../../../backend/controller/socket/helpers/socket.friendController.js";
import MockSocket from "../../../mocks/config/mockSocket.js";
import MockData from "../../../mocks/config/mockData.js";
import MockSocketModel from "../../../mocks/config/mockSocketModel.js";

class FriendFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "friends");

    if (newDoc) {
      this._id = this.queriedDoc._id;
    }
  }

  static async findOne(query) {
    return new this().findOne(query);
  }

  static async findById(id) {
    return new this().findById(id);
  }

  static async create(doc) {
    return new this().create(doc);
  }

  static async findOneAndUpdate(id, updates, options = {}) {
    return new this().findByIdAndUpdate(id, updates, (options = {}));
  }
}

class UserFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "users");
  }
  static async findOne(query) {
    return new this().findOne(query);
  }

  static async findById(id) {
    return new this().findById(id);
  }

  static async create(doc) {
    return new this().create(doc);
  }
}

const mockUserModel = new MockSocketModel(undefined, "users");
const mockFriendModel = new MockSocketModel(undefined, "friends");

const mockSocketInstance = new MockSocket();
const socialData = new MockData();
let mockUsers;
let newMockUser;
let existingFriendship;

describe("socket social controller API", () => {
  before(async () => {
    for (const user of socialData.mockUsers) {
      await mockUserModel.create(user);
    }

    newMockUser = await mockUserModel.create({
      _id: "4",
      name: "Jack Hearts",
      avatar: "jack_avatar",
    });

    for (const user of mockUserModel.storage.users) {
      mockSocketInstance.connectUser(user._id);
    }

    mockUsers = mockUserModel.storage.users;

    existingFriendship = await handleNewRequest(FriendFactory, {
      senderId: mockUsers[2]._id,
      receiverId: mockUserModel.storage.users[3]._id,
    });
  });

  beforeEach(() => {
    mockSocketInstance.resetHistory();
  });

  after(() => {
    mockUserModel.cleanupAll();
  });

  describe("send friend request", () => {
    it("should create a new friend request and verify it", async () => {
      const reqSender = mockUsers[1];
      const reqReceiver = mockUsers[2];
      const eventData = {
        senderId: reqSender._id,
        receiverId: reqReceiver._id,
      };

      const response = await handleNewRequest(FriendFactory, eventData);

      expect(response._id).to.equal(
        `frdoc_${mockFriendModel.storage.friends.length}`
      );
      expect(response.senderId).to.equal(reqSender._id);
      expect(response.senderName).to.equal(reqSender.name);
      expect(response.senderAvatar).to.equal(reqSender.avatar);
      expect(response.receiverId).to.equal(reqReceiver._id);
      expect(response.receiverName).to.equal(reqReceiver.name);
      expect(response.receiverAvatar).to.equal(reqReceiver.avatar);
      expect(response.status).to.equal("pending");
    });

    it("should return a `Friend request already pending` error message", async () => {
      const reqSender = mockUsers[2];
      const reqReceiver = mockUsers[3];
      const eventData = {
        senderId: reqSender._id,
        receiverId: reqReceiver._id,
      };

      try {
        await handleNewRequest(FriendFactory, eventData);
        throw new Error("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal("Friend request already pending");
      }
    });

    it("should return a `Please provide valid friend request data` error message", async () => {
      const reqReceiver = mockUsers[3];
      const eventData = {
        senderId: undefined,
        receiverId: reqReceiver._id,
      };

      try {
        await handleNewRequest(FriendFactory, eventData);
        throw new Error("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal(
          "Please provide valid friend request data"
        );
      }
    });
  });

});
