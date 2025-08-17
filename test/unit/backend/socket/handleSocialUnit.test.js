import { expect } from "chai";
import handleSocialEvents from "../../../../backend/controller/socket/handleSocial.js";
import MockSocket from "../../../mocks/config/mockSocket.js";
import MockData from "../../../mocks/config/mockData.js";
import MockModel from "../../../mocks/config/mockModel.js";

const mockUserModel = new MockModel("users");
const mockFriendModel = new MockModel("friends");
const mockSocketInstance = new MockSocket();
const socialData = new MockData();
let eventSubscriptions;
let mockUsers;
let mockSocialHandler;

describe("socket social API", () => {
  before(async () => {
    for (const user of socialData.mockUsers) {
      await mockUserModel.create(user);
    }

    for (const user of mockUserModel.storage.users) {
      mockSocketInstance.connectUser(user._id);
    }

    mockSocialHandler = handleSocialEvents(
      {
        User: mockUserModel,
        Friend: mockFriendModel,
      },
      mockSocketInstance
    );

    eventSubscriptions = mockSocketInstance.subscriptions;
    mockUsers = mockUserModel.storage.users;
  });

  beforeEach(() => {
    mockSocketInstance.resetHistory();
  });

  after(() => {
    mockUserModel.cleanupAll();
  });
});
