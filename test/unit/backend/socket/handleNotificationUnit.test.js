import { expect } from "chai";
import { createMockFactory } from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  createNewNotification,
  markNotificationAsRead,
} from "../../../../backend/controller/socket/controllers/notificationControllers.js";

const userFactory = new createMockFactory("users");
const quizFactory = new createMockFactory("quizzes");
const notificationFactory = new createMockFactory("notifications");

const mockExamData = new MockData();

const userStorage = mockExamData.mockUsers;
const quizStorage = mockExamData.mockQuizzes;

let userOne;
let userTwo;
let userThree;
let quizOne;

describe("socket notification controllers", () => {
  before(async () => {
    for (const user of userStorage) {
      await userFactory.create(user);
    }

    userOne = userFactory.getStorage().users[0];
    userTwo = userFactory.getStorage().users[1];
    userThree = userFactory.getStorage().users[2];

    quizOne = await quizFactory.create({
      ...quizStorage[0],
      title: "Quiz One",
    });
  });

  after(async () => {
    userFactory.cleanupAll();
  });

  describe("create new notification", () => {
    it("should create a new notification for `new friend request` event and verify it", async () => {
      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        receiverId: userTwo._id,
        notificationName: "new friend request",
      };

      const response = await createNewNotification(models, eventData);

      expect(response.success).to.equal(true);

      expect(response.savedNotification._id).to.equal("frdoc_1");

      expect(response.savedNotification.receiver).to.equal(userTwo._id);

      expect(response.savedNotification.receiver).to.equal(
        eventData.receiverId
      );

      expect(response.savedNotification.message).to.equal(
        `${userOne.name} sent you a friend request`
      );
    });

    it("should create a new notification for `friend request accepted` event and verify it", async () => {
      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        receiverId: userTwo._id,
        notificationName: "friend request accepted",
      };

      const response = await createNewNotification(models, eventData);

      expect(response.success).to.equal(true);

      expect(response.savedNotification._id).to.equal("frdoc_2");

      expect(response.savedNotification.receiver).to.equal(userTwo._id);

      expect(response.savedNotification.receiver).to.equal(
        eventData.receiverId
      );

      expect(response.savedNotification.message).to.equal(
        `${userOne.name} accepted your friend request`
      );
    });

    it("should create a new notification for event `quiz graded` and verify it", async () => {
      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        notificationName: "quiz graded",
        quizScore: 2,
        quizName: quizOne.title,
        quizId: quizOne._id,
      };

      const response = await createNewNotification(models, eventData);

      expect(response.success).to.equal(true);
      expect(response.savedNotification._id).to.equal("frdoc_3");
      expect(response.savedNotification.message).to.equal(
        `You scored ${eventData.quizScore} points on quiz ${eventData.quizName}`
      );
    });

    it("should return a `Missing models` error message", async () => {
      const models = {
        User: undefined,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        notificationName: "quiz graded",
        quizScore: 2,
        quizName: quizOne.title,
        quizId: quizOne._id,
      };

      try {
        await createNewNotification(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new notification: Missing models"
        );
      }
    });

    it("should return a `User does not exist` error message", async () => {
      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: undefined,
        notificationName: "quiz graded",
        quizScore: 2,
        quizName: quizOne.title,
        quizId: quizOne._id,
      };

      try {
        await createNewNotification(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new notification: User does not exist"
        );
      }
    });

    it("should return a `Quiz not found` error message", async () => {
      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        notificationName: "quiz graded",
        quizScore: 2,
        quizName: quizOne.title,
        quizId: undefined,
      };

      try {
        await createNewNotification(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new notification: Quiz not found"
        );
      }
    });

    it("should return a `Database failure: unable to save the notification` error message", async () => {
      const originalMethod = notificationFactory.save;

      notificationFactory.save = () => {
        return null;
      };

      const models = {
        User: userFactory,
        Notification: notificationFactory,
        Quiz: quizFactory,
      };

      const eventData = {
        senderId: userOne._id,
        notificationName: "quiz graded",
        quizScore: 2,
        quizName: quizOne.title,
        quizId: quizOne._id,
      };

      try {
        await createNewNotification(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new notification: Database failure: unable to save the notification"
        );
      }

      notificationFactory.save = originalMethod;
    });
  });

  describe("mark notification as read", () => {
    it("should mark notification as read and verify it", async () => {
      const models = { Notification: notificationFactory };
      const unreadNotification =
        notificationFactory.getStorage().notifications[0];

      const eventData = { notificationId: unreadNotification._id };

      const response = await markNotificationAsRead(models, eventData);

      for (const [key, value] of Object.entries(unreadNotification)) {
        expect(response.updatedNotification[key]).to.equal(value);
      }

      expect(response.updatedNotification.isRead).to.equal(true);
    });

    it("should return a `Error marking notification as read: Missing models` error message", async () => {
      const models = { Notification: undefined };
      const unreadNotification =
        notificationFactory.getStorage().notifications[0];

      const eventData = { notificationId: unreadNotification._id };

      try {
        await markNotificationAsRead(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error marking notification as read: Missing models"
        );
      }
    });

    it("should return a `Error marking notification as read: Invalid notification id` error message", async () => {
      const models = { Notification: notificationFactory };

      const eventData = { notificationId: undefined };

      try {
        await markNotificationAsRead(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error marking notification as read: Invalid notification id"
        );
      }
    });

});
