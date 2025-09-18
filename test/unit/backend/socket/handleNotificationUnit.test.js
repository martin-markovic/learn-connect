import { expect } from "chai";
import { createMockFactory } from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  createNewNotification,
} from "../../../../backend/controller/socket/controllers/notificationControllers.js";

const userFactory = new createMockFactory("users");
const quizFactory = new createMockFactory("users");
const notificationFactory = new createMockFactory("users");

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

});
