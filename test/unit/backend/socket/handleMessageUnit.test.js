import { expect } from "chai";
import MockSocketModel from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import { createMessage } from "../../../../backend/controller/socket/controllers/socket.messageControllers.js";

class ChatFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "chats");

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

  static async cleanupAll() {
    return new this().cleanupAll();
  }

  static getStorage() {
    return new this().storage;
  }
}

class ConversationFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "conversations");

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

  static async cleanupAll() {
    return new this().cleanupAll();
  }
}

class UserFactory extends MockSocketModel {
  constructor(newDoc) {
    super(newDoc, "users");

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

  static async cleanupAll() {
    return new this().cleanupAll();
  }
}

const ChatData = new MockData();

let mockSender;
let mockReceiver;
let noChatUser;

describe("socket message controllers", () => {
  before(async () => {
    mockSender = await UserFactory.create(ChatData.mockUsers[0]);

    mockReceiver = await UserFactory.create(ChatData.mockUsers[1]);

    noChatUser = await UserFactory.create(ChatData.mockUsers[2]);
  });

  after(() => {
    ChatFactory.cleanupAll();
    ConversationFactory.cleanupAll();
    UserFactory.cleanupAll();
  });

  describe("create message", () => {
    it("should create a new message for an empty chat and verify it", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const mockMsgText = "test message 1";
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: mockMsgText,
      };

      const response = await createMessage(models, eventData);

      expect(response._id).to.equal("frdoc_1");
      expect(response.chatId).to.equal("frdoc_1");
      expect(response.senderId).to.equal(mockSender._id);
      expect(response.receiverId).to.equal(mockReceiver._id);
      expect(response.senderName).to.equal(mockSender.name);
      expect(response.receiverName).to.equal(mockReceiver.name);
      expect(response.senderAvatar).to.equal(mockSender.avatar);
      expect(response.receiverAvatar).to.equal(mockReceiver.avatar);
      expect(response.text).to.equal(mockMsgText);
      expect(response.isRead).to.equal(false);

      const chatStorage = ChatFactory.getStorage().chats;

      expect(chatStorage.length).to.equal(1);
    });

    it("should create a new message for a non-empty chat and verify it", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const mockMsgText = "test message 2";
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: mockMsgText,
      };

      const response = await createMessage(models, eventData);

      expect(response._id).to.equal("frdoc_2");
      expect(response.chatId).to.equal("frdoc_2");
      expect(response.senderId).to.equal(mockSender._id);
      expect(response.receiverId).to.equal(mockReceiver._id);
      expect(response.senderName).to.equal(mockSender.name);
      expect(response.receiverName).to.equal(mockReceiver.name);
      expect(response.senderAvatar).to.equal(mockSender.avatar);
      expect(response.receiverAvatar).to.equal(mockReceiver.avatar);
      expect(response.text).to.equal(mockMsgText);
      expect(response.isRead).to.equal(false);

      const chatStorage = ChatFactory.getStorage().chats;

      expect(chatStorage.length).to.equal(2);
    });
  });
});
