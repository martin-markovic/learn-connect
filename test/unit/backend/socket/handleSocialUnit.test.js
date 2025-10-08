import { expect } from "chai";
import {
  handleNewRequest,
  handleProcessRequest,
  handleRemoveFriend,
  handleBlockUser,
} from "../../../../backend/controller/socket/controllers/socialControllers.js";
// } from "../../../../backend/controller/socket/helpers/socket.friendController.js";
import MockSocket from "../../../mocks/config/socket/mockSocket.js";
import MockData from "../../../mocks/config/mockData.js";
import MockSocketModel from "../../../mocks/config/socket/mockSocketModel.js";

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

  static async findOneAndUpdate(query, updates, options = {}) {
    return new this().findOneAndUpdate(query, updates, options);
  }

  static async deleteOne(query) {
    return new this().deleteOne(query);
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

  after(() => {
    mockUserModel.cleanupAll();
    mockFriendModel.cleanupAll();
  });

  describe("send friend request event, when the request is", () => {
    describe("valid and complete", () => {
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
    });

    describe("invalid", () => {
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

  describe("process friend request event, when the request is", () => {
    describe("valid and complete", () => {
      it("should process the accepted request and verify it", async () => {
        const reqSender = mockUsers[3];
        const reqReceiver = mockUsers[2];
        const updatedStatus = "accepted";
        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
          userResponse: updatedStatus,
        };

        const response = await handleProcessRequest(FriendFactory, eventData);

        expect(response._id).to.equal(existingFriendship._id);
        expect(response.status).to.equal(updatedStatus);
        expect(response.receiverId).to.equal(reqReceiver._id);
        expect(response.senderId).to.equal(reqSender._id);

        await mockFriendModel.deleteOne({ _id: response._id });

        mockFriendModel.storage.friends[
          mockFriendModel.storage.friends.length
        ] = {
          _id: "frdoc_1",
          sender: mockUsers[3]._id,
          receiver: mockUserModel.storage.users[2]._id,
          status: "pending",
        };
      });

      it("should process the declined request and verify it", async () => {
        const reqSender = mockUsers[2];
        const reqReceiver = mockUsers[3];
        const updatedStatus = "declined";

        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
          userResponse: updatedStatus,
        };

        const storageD = mockFriendModel.storage.friends;

        const response = await handleProcessRequest(FriendFactory, eventData);

        const existsInStorage = mockFriendModel.storage.friends.find(
          (item) => item._id === response._id
        );

        expect(response._id).to.equal(existingFriendship._id);
        expect(existsInStorage).to.equal(undefined);
      });
    });

    describe("invalid", () => {
      it("should return the `Please provide valid request data` error message", async () => {
        const reqReceiver = mockUsers[2];
        const updatedStatus = "accepted";
        const eventData = {
          senderId: undefined,
          receiverId: reqReceiver._id,
          userResponse: updatedStatus,
        };

        try {
          await handleProcessRequest(FriendFactory, eventData);
          throw new Error("Expected function to throw an error");
        } catch (error) {
          expect(error.message).to.equal("Please provide valid request data");
        }
      });

      it("should return the `Invalid friend request status` error message", async () => {
        const reqSender = mockUsers[3];
        const reqReceiver = mockUsers[2];
        const updatedStatus = "wrong";
        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
          userResponse: updatedStatus,
        };

        try {
          await handleProcessRequest(FriendFactory, eventData);
          throw new Error("Expected function to throw an error");
        } catch (error) {
          expect(error.message).to.equal("Invalid friend request status");
        }
      });

      it("should return the `Friend request not found` error message", async () => {
        const reqSender = mockUsers[1];
        const reqReceiver = mockUsers[3];
        const updatedStatus = "declined";
        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
          userResponse: updatedStatus,
        };

        try {
          await handleProcessRequest(FriendFactory, eventData);
          throw new Error("Expected function to throw an error");
        } catch (error) {
          expect(error.message).to.equal("Friend request not found");
        }
      });
    });
  });

  describe("remove friend event, when the request is", () => {
    it("should remove a friend document and verify it", async () => {
      const reqSender = mockUsers[1];
      const reqReceiver = mockUsers[2];
      const eventData = {
        senderId: reqSender._id,
        receiverId: reqReceiver._id,
      };

      const result = await handleRemoveFriend(FriendFactory, eventData);

      const existsInStorage = mockFriendModel.storage.friends.find(
        (item) => item._id === result
      );

      expect(result).to.equal("frdoc_2");
      expect(existsInStorage).to.equal(undefined);
    });

    it("should return a `Invalid user data` error message", async () => {
      const reqReceiver = mockUsers[2];
      const eventData = {
        senderId: undefined,
        receiverId: reqReceiver._id,
      };

      try {
        await handleRemoveFriend(FriendFactory, eventData);
        throw new Error("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal("Invalid user data");
      }
    });

    it("should return a `Friend not found` error message", async () => {
      const reqSender = mockUsers[1];
      const reqReceiver = mockUsers[3];
      const eventData = {
        senderId: reqSender._id,
        receiverId: reqReceiver._id,
      };

      try {
        await handleRemoveFriend(FriendFactory, eventData);
        throw new Error("Expected function to throw an error");
      } catch (error) {
        expect(error.message).to.equal("Friend not found");
      }
    });
  });

  describe("block user event, when the request is", () => {
    describe("valid and complete", () => {
      it("should change the existing friendship status to `blocked` and verify it", async () => {
        const reqSender = mockUsers[1];
        const reqReceiver = mockUsers[3];

        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
        };

        const response = await handleBlockUser(
          UserFactory,
          FriendFactory,
          eventData
        );

        expect(response).to.equal(reqReceiver._id);
      });

      it("should set the friendship status to `blocked` and verify it", async () => {
        const reqSender = mockUsers[2];
        const reqReceiver = mockUsers[3];

        const eventData = {
          senderId: reqSender._id,
          receiverId: reqReceiver._id,
        };

        const response = await handleBlockUser(
          UserFactory,
          FriendFactory,
          eventData
        );

        expect(response).to.equal(reqReceiver._id);
      });
    });

    describe("invalid", () => {
      it("should return the `Please provide valid client data` error message", async () => {
        const reqReceiver = mockUsers[3];

        const eventData = {
          senderId: undefined,
          receiverId: reqReceiver._id,
        };

        try {
          await handleBlockUser(UserFactory, FriendFactory, eventData);
          throw new Error("Expected function to throw an error");
        } catch (error) {
          expect(error.message).to.equal("Please provide valid client data");
        }
      });

      it("should return the `User not found` error message", async () => {
        const reqSender = mockUsers[1];

        const eventData = {
          senderId: reqSender._id,
          receiverId: "1234",
        };

        try {
          await handleBlockUser(UserFactory, FriendFactory, eventData);
          throw new Error("Expected function to throw an error");
        } catch (error) {
          expect(error.message).to.equal("User not found");
        }
      });
    });
  });
});
