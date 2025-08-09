import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockRes from "../../../mocks/config/mockRes.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  getMessages,
  getChatStatus,
} from "../../../../backend/controller/chat/chatController.js";

const MockUserModel = new MockModel("users");
const MockChatModel = new MockModel("chats");
const MockConversationModel = new MockModel("conversations");

const mockGetMessages = getMessages(MockChatModel);
const mockGetChatStatus = getChatStatus(MockUserModel);

const mockChatData = new MockData();

let mockUserOne;
let noMessageUser;

const chatRes = new MockRes();

const createMessage = (senderId, msgNumber, lengthList) => ({
  sender: { _id: String(senderId) },
  receiver: { _id: String((senderId + msgNumber) % 3) },
  text: `${
    lengthList > 1 ? (lengthList > 3 ? "mutual friend" : "receiver") : "sender"
  } message ${msgNumber}`,
  isRead: false,
});

const updateConversationList = (senderId = 0, msgNumber = 1, messages = []) => {
  const lengthList = messages.length;
  if (lengthList === 6) return messages;

  messages.push(createMessage(senderId, msgNumber, lengthList));

  return updateConversationList(
    msgNumber === 2 ? senderId + 1 : senderId,
    msgNumber === 2 ? 1 : msgNumber + 1,
    messages
  );
};

const conversationList = updateConversationList();

describe("Chat API", () => {
  before(async () => {
    await MockUserModel.create({ ...mockChatData.mockUsers[0], _id: "0" });
    await MockUserModel.create({ ...mockChatData.mockUsers[1], _id: "1" });
    await MockUserModel.create({ ...mockChatData.mockUsers[2], _id: "99" });

    mockUserOne = MockUserModel.storage.users[0];
    noMessageUser = MockUserModel.storage.users[2];

    conversationList.forEach(async (c) => {
      await MockChatModel.create(c);
    });
  });

  beforeEach(() => {
    chatRes.reset();
  });

  after(() => {
    MockUserModel.cleanupAll();
    MockChatModel.cleanupAll();
  });

  describe("getMessages", () => {
    it("should fetch messages and verify them", async () => {
      const mockReq = { user: { _id: mockUserOne._id } };
      await mockGetMessages(mockReq, chatRes);

      expect(chatRes.statusCode).to.equal(200);
      expect(chatRes.body.length).to.equal(2);
      expect(
        chatRes.body.every((chat) =>
          chat.messages.every(
            (m) =>
              m.senderId === mockUserOne._id || m.receiverId === mockUserOne._id
          )
        )
      ).to.be.true;

      chatRes.body.forEach((chat) => {
        chat.messages.forEach((msg) => {
          expect(msg).to.have.all.keys([
            "_id",
            "text",
            "senderId",
            "senderName",
            "senderAvatar",
            "receiverId",
            "receiverName",
            "receiverAvatar",
            "createdAt",
            "isRead",
          ]);
        });
      });
    });

    it("should return an empty array as response payload", async () => {
      const mockReq = { user: { _id: noMessageUser._id } };

      await mockGetMessages(mockReq, chatRes);

      expect(chatRes.statusCode).to.equal(200);

      expect(chatRes.body.length).to.equal(0);
    });

    it("should return `Authentication required` error message", async () => {
      const mockReq = { user: { _id: undefined } };

      await mockGetMessages(mockReq, chatRes);

      expect(chatRes.statusCode).to.equal(403);
      expect(chatRes.body.message).to.equal("Authentication required");
    });
  });
});
