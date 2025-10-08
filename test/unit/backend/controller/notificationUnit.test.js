import { expect } from "chai";
import MockModel from "../../../mocks/config/CRUD/mockModel.js";
import MockData from "../../../mocks/config/mockData.js";
import MockRes from "../../../mocks/config/CRUD/mockRes.js";
import { getNotifications } from "../../../../backend/controller/notifications/notificationController.js";

const notificationData = new MockData();
const mockNotificationModel = new MockModel("notifications");
const mockUserModel = new MockModel("users");
const notificationRes = new MockRes();

const mockGetNotifications = getNotifications(
  mockNotificationModel,
  mockUserModel
);

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

  describe("getNotifications", () => {
    describe("when payload is valid and complete", () => {
      it("should fetch unread notification list and verify it", async () => {
        const mockReq = { params: { userId: mockUserOne._id } };

        await mockGetNotifications(mockReq, notificationRes);

        const unreadNotification = mockNotificationList.filter(
          (n) => n.isRead === false && n.receiver === mockUserOne._id
        )[0];

        expect(notificationRes.statusCode).to.equal(200);
        expect(notificationRes.body.length).to.equal(1);
        for (const [key, value] of Object.entries(notificationRes.body[0])) {
          expect(unreadNotification[key]).to.equal(value);
        }
      });
    });

    describe("when the request is invalid", () => {
      it("should fetch an empty array and verify it", async () => {
        const mockReq = { params: { userId: mockUserThree._id } };

        await mockGetNotifications(mockReq, notificationRes);

        expect(notificationRes.statusCode).to.equal(200);
        expect(notificationRes.body.length).to.equal(0);
      });

      it("should return a `User id is required` error message", async () => {
        const mockReq = { params: { userId: undefined } };

        await mockGetNotifications(mockReq, notificationRes);

        expect(notificationRes.statusCode).to.equal(403);
        expect(notificationRes.body.message).to.equal("User id is required");
      });

      it("should return a `User does not exist` error message", async () => {
        const mockReq = { params: { userId: "99" } };

        await mockGetNotifications(mockReq, notificationRes);

        expect(notificationRes.statusCode).to.equal(404);
        expect(notificationRes.body.message).to.equal("User does not exist");
      });
    });
  });
});
