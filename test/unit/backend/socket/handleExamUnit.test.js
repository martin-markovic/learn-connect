import { createMockFactory } from "../../../mocks/config/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import {
  createExam,
  finishExam,
  updateExam,
} from "../../../../backend/controller/socket/controllers/examControllers.js";
import { expect } from "chai";

const userFactory = createMockFactory("users");
const examFactory = createMockFactory("exams");
const quizFactory = createMockFactory("quizzes");
const classroomFactory = createMockFactory("classrooms");
const scoreFactory = createMockFactory("scores");

const mockExamData = new MockData();

const mockQuiz = mockExamData.mockQuizzes[0];
const mockClassroom = mockExamData.mockClassrooms[0];

let hasExamUser;
let noExamUser;
let unEnrolledUser;
let createdQuiz;
let createdClassroom;
const quizTimeLimit = 4;

describe("socket exam controllers", () => {
  before(async () => {
    hasExamUser = await userFactory.create(mockExamData.mockUsers[0]);
    noExamUser = await userFactory.create(mockExamData.mockUsers[1]);
    unEnrolledUser = await userFactory.create(mockExamData.mockUsers[2]);

    createdClassroom = await classroomFactory.create({
      ...mockClassroom,
      students: [hasExamUser, noExamUser],
    });

    createdQuiz = await quizFactory.create({
      ...mockQuiz,
      classroom: createdClassroom._id,
      timeLimit: quizTimeLimit,
      title: "created quiz",
    });
  });

  after(() => {
    userFactory.cleanupAll();
  });

