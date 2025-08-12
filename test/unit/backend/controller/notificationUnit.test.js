import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockData from "../../../mocks/config/mockData.js";
import MockRes from "../../../mocks/config/mockRes.js";
import { getNotifications } from "../../../../backend/controller/notifications/notificationController.js";

const notificationData = new MockData();
const mockNotificationModel = new MockModel("notifications");
const mockUserModel = new MockModel("users");
const notificationRes = new MockRes();

const mockGetNotifications = getNotifications(mockNotificationModel);

const mockUserOne = notificationData.mockUsers[0];
const mockUserTwo = notificationData.mockUsers[1];
const mockUserThree = notificationData.mockUsers[2];

function createNotificationList(indx) {
  if (indx === 3) {
    return [];
  }

  const isFirstUser = indx < 2;

  const notification = {
    _id: `${indx + 1}`,
    receiver: `${isFirstUser ? mockUserOne._id : mockUserTwo._id}`,
    message: `${isFirstUser ? "First" : "Second"} user notification, number ${
      isFirstUser ? indx + 1 : 1
    }`,
    date: new Date().toISOString(),
    isRead: indx % 2 === 0 ? false : true,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), //
  };

  return [notification, ...createNotificationList(indx + 1)];
}

const mockNotificationList = createNotificationList(0);

describe("Notification API", () => {
  before(async () => {
    await mockUserModel.create(mockUserOne);
    await mockUserModel.create(mockUserTwo);
    await mockUserModel.create(mockUserThree);

    mockNotificationList.forEach(
      async (n) => await mockNotificationModel.create(n)
    );
  });

  beforeEach(() => {
    notificationRes.reset();
  });

  after(() => {
    mockNotificationModel.cleanupAll();
  });
});
