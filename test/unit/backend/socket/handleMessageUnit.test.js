import { expect } from "chai";
import MockSocketModel from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  changeChatStatus,
  createMessage,
  markMessageSeen,
  updateChatMessages,
} from "../../../../backend/controller/socket/controllers/socket.messageControllers.js";

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

  static async updateMany(query, updates) {
    try {
      const instance = new this();

      const itemsFound = instance.storage[instance.currentModel].filter(
        (item) =>
          Object.entries(query).every(([key, value]) => {
            if (typeof value === "object" && value !== null && "$in" in value) {
              return value.$in.includes(item[key]);
            }

            return item[key] === value;
          })
      );

      if (!itemsFound) {
        return { matchedCount: 0, modifiedCount: 0 };
      }

      itemsFound.forEach((item) => {
        Object.assign(item, updates.$set);
      });

      return { matchedCount: 1, modifiedCount: itemsFound.length };
    } catch (error) {
      const errorMessage = `Error updating documents: ${
        error.message || "Unknown error"
      }`;

      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    return new this().findByIdAndUpdate(id, updates, options);
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

  static async findByIdAndUpdate(id, updates, options = {}) {
    return new this().findByIdAndUpdate(id, updates, options);
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

      const chatStorage = ChatFactory.getStorage().chats[0].conversation;

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
      expect(response.senderId).to.equal(mockSender._id);
      expect(response.receiverId).to.equal(mockReceiver._id);
      expect(response.senderName).to.equal(mockSender.name);
      expect(response.receiverName).to.equal(mockReceiver.name);
      expect(response.senderAvatar).to.equal(mockSender.avatar);
      expect(response.receiverAvatar).to.equal(mockReceiver.avatar);
      expect(response.text).to.equal(mockMsgText);
      expect(response.isRead).to.equal(false);

      const chatStorage = ChatFactory.getStorage().chats[0].conversation;

      expect(chatStorage.length).to.equal(2);
    });

    it("should return a `Error creating new message: Missing models` error message", async () => {
      const models = { Chat: undefined, Conversation: ConversationFactory };
      const mockMsgText = "test message";
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: mockMsgText,
      };

      try {
        await createMessage(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new message: Missing models"
        );
      }
    });

    it("should return a `Error creating new message: Please provide required message data` error message", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const mockMsgText = null;
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: mockMsgText,
      };

      try {
        await createMessage(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new message: Please provide required message data"
        );
      }
    });

    it("should return a `Error creating new message: Failed to retrieve saved message` error message", async () => {
      const originalSave = ChatFactory.save;
      const mockSave = () => {
        return null;
      };
      ChatFactory.save = mockSave;

      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const mockMsgText = "test message 3";
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: mockMsgText,
      };

      try {
        await createMessage(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new message: Failed to retrieve saved message"
        );
      }

      ChatFactory.save = originalSave;
    });
  });

  describe("update chat messages", () => {
    it("should update chat messages and verify them", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const eventData = {
        senderId: mockReceiver._id,
        receiverId: mockSender._id,
      };

      const response = await updateChatMessages(models, eventData);

      expect(response.success).to.equal(true);
      expect(response.newMessages).to.equal(true);

      const conversationStorage = ChatFactory.getStorage().conversations;

      conversationStorage.forEach((item) => expect(item.isRead).to.equal(true));
    });

    it("should return early, with a message `No unread messages`", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
      };

      const response = await updateChatMessages(models, eventData);

      expect(response.success).to.equal(true);
      expect(response.newMessages).to.equal(false);
      expect(response.message).to.equal("No unread messages");
    });

    it("should return early, with a message `Missing models`", async () => {
      const models = { Chat: undefined, Conversation: ConversationFactory };
      const eventData = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
      };

      try {
        await updateChatMessages(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Missing models");
      }
    });

    it("should return with a message `Chat not found`", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };
      const eventData = {
        senderId: mockSender._id,
        receiverId: "999",
      };

      const response = await updateChatMessages(models, eventData);
      expect(response.success).to.equal(false);
      expect(response.newMessages).to.equal(false);
      expect(response.message).to.equal("Chat not found");
    });

    it("should return early, with a message `No chat messages`", async () => {
      const models = { Chat: ChatFactory, Conversation: ConversationFactory };

      const testUserId = "test user id";
      ChatFactory.create({
        participants: [mockSender._id, testUserId],
        conversation: [],
      });

      const eventData = {
        senderId: mockSender._id,
        receiverId: testUserId,
      };

      const response = await updateChatMessages(models, eventData);
      expect(response.success).to.equal(true);
      expect(response.newMessages).to.equal(false);
      expect(response.message).to.equal("No chat messages");
    });
  });

  describe("mark message as seen", () => {
    it("should update new message `isRead` property to true and verify it", async () => {
      const models = { Conversation: ConversationFactory };

      const newMessage = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: "mark message seen test message",
        isRead: false,
      };

      const createdMessage = await ConversationFactory.create(newMessage);

      const eventData = {
        messageId: createdMessage?._id,
      };

      const response = await markMessageSeen(models, eventData);

      expect(response._id).to.equal(createdMessage._id);
      expect(response.senderId).to.equal(createdMessage.senderId);
      expect(response.receiverId).to.equal(createdMessage.receiverId);
      expect(response.text).to.equal(createdMessage.text);
      expect(response.isRead).to.equal(true);
    });

    it("should return `Missing models` error message", async () => {
      const models = { Conversation: undefined };

      const eventData = {
        messageId: "test message id",
      };

      try {
        await markMessageSeen(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Missing models");
      }
    });

    it("should return `Invalid message id` error message", async () => {
      const models = { Conversation: ConversationFactory };

      const eventData = {
        messageId: undefined,
      };

      try {
        await markMessageSeen(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Invalid message id");
      }
    });
  });

  describe("change chat status", () => {
    it("should update chat status value to false and verify it", async () => {
      const models = { User: UserFactory };

      const newStatus = false;

      const eventData = {
        userId: mockSender._id,
        chatConnected: newStatus,
      };

      const response = await changeChatStatus(models, eventData);

      expect(response.updatedStatus._id).to.equal(mockSender._id);
      expect(response.updatedStatus.online).to.equal(newStatus);
      expect(response.success).to.equal(true);
    });

    it("should update chat status value to true and verify it", async () => {
      const models = { User: UserFactory };

      const newStatus = true;

      const eventData = {
        userId: mockSender._id,
        chatConnected: newStatus,
      };

      const response = await changeChatStatus(models, eventData);

      expect(response.updatedStatus._id).to.equal(mockSender._id);
      expect(response.updatedStatus.online).to.equal(newStatus);
      expect(response.success).to.equal(true);
    });

    it("should return a `Missing models` error message", async () => {
      const models = { User: undefined };

      const newStatus = true;

      const eventData = {
        userId: mockSender._id,
        chatConnected: newStatus,
      };

      try {
        await changeChatStatus(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Missing models");
      }
    });

    it("should return a `User is not authorized` error message", async () => {
      const models = { User: UserFactory };

      const newStatus = true;

      const eventData = {
        userId: "999",
        chatConnected: newStatus,
      };

      try {
        await changeChatStatus(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("User is not authorized");
      }
    });

    it("should return a `Database update failure` error message", async () => {
      const models = { User: UserFactory };
      const originalMethod = UserFactory.findByIdAndUpdate;

      UserFactory.findByIdAndUpdate = () => {
        return null;
      };

      const newStatus = true;

      const eventData = {
        userId: "999",
        chatConnected: newStatus,
      };

      try {
        await changeChatStatus(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Database update failure");
      }

      UserFactory.findByIdAndUpdate = originalMethod;
    });
  });
});
