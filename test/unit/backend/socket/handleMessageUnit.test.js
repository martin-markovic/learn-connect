import { expect } from "chai";
import { createMockFactory } from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  changeChatStatus,
  createMessage,
  markMessageSeen,
  updateChatMessages,
} from "../../../../backend/controller/socket/controllers/socket.messageControllers.js";

const userFactory = createMockFactory("users");
const chatFactory = createMockFactory("chats");
const conversationFactory = createMockFactory("conversations");

const ChatData = new MockData();

let mockSender;
let mockReceiver;

describe("socket message controllers", () => {
  before(async () => {
    mockSender = await userFactory.create(ChatData.mockUsers[0]);

    mockReceiver = await userFactory.create(ChatData.mockUsers[1]);
  });

  after(() => {
    userFactory.cleanupAll();
  });

  describe("create message", () => {
    it("should create a new message for an empty chat and verify it", async () => {
      const models = { Chat: chatFactory, Conversation: conversationFactory };
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

      const chatStorage = chatFactory.getStorage().chats[0].conversation;

      expect(chatStorage.length).to.equal(1);
    });

    it("should create a new message for a non-empty chat and verify it", async () => {
      const models = { Chat: chatFactory, Conversation: conversationFactory };
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

      const chatStorage = chatFactory.getStorage().chats[0].conversation;

      expect(chatStorage.length).to.equal(2);
    });

    it("should return a `Error creating new message: Missing models` error message", async () => {
      const models = { Chat: undefined, Conversation: conversationFactory };
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
      const models = { Chat: chatFactory, Conversation: conversationFactory };
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
      const originalSave = chatFactory.save;
      const mockSave = () => {
        return null;
      };
      chatFactory.save = mockSave;

      const models = { Chat: chatFactory, Conversation: conversationFactory };
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

      chatFactory.save = originalSave;
    });
  });

  describe("update chat messages", () => {
    it("should update chat messages and verify them", async () => {
      const models = { Chat: chatFactory, Conversation: conversationFactory };
      const eventData = {
        senderId: mockReceiver._id,
        receiverId: mockSender._id,
      };

      const response = await updateChatMessages(models, eventData);

      expect(response.success).to.equal(true);
      expect(response.newMessages).to.equal(true);

      const conversationStorage = chatFactory.getStorage().conversations;

      conversationStorage.forEach((item) => expect(item.isRead).to.equal(true));
    });

    it("should return early, with a message `No unread messages`", async () => {
      const models = { Chat: chatFactory, Conversation: conversationFactory };
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
      const models = { Chat: undefined, Conversation: conversationFactory };
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
      const models = { Chat: chatFactory, Conversation: conversationFactory };
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
      const models = { Chat: chatFactory, Conversation: conversationFactory };

      const testUserId = "test user id";
      chatFactory.create({
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
      const models = { Conversation: conversationFactory };

      const newMessage = {
        senderId: mockSender._id,
        receiverId: mockReceiver._id,
        text: "mark message seen test message",
        isRead: false,
      };

      const createdMessage = await conversationFactory.create(newMessage);

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
      const models = { Conversation: conversationFactory };

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
      const models = { User: userFactory };

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
      const models = { User: userFactory };

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
      const models = { User: userFactory };

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
      const models = { User: userFactory };
      const originalMethod = userFactory.findByIdAndUpdate;

      userFactory.findByIdAndUpdate = () => {
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

      userFactory.findByIdAndUpdate = originalMethod;
    });
  });
});
