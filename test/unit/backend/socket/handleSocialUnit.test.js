import { expect } from "chai";
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
});
