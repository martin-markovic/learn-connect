import MockModel from "../../mocks/config/mockModel.js";
import MockData from "../../mocks/config/mockData.js";
import MockRes from "../../mocks/config/mockRes.js";
import {
  getUserQuizzes,
  getClassroomQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../../../backend/controller/quizzes/quizController.js";
import { expect } from "chai";

const MockQuizModel = new MockModel("quizzes");
const MockUserModel = new MockModel("users");
const { mockUsers, mockQuizzes, mockClassrooms } = new MockData();

const mockGetUserQuizzes = getUserQuizzes(MockUserModel, MockQuizModel);
const mockGetClassroomQuizzes = getClassroomQuizzes(
  MockUserModel,
  MockQuizModel
);
const mockUpdateQuiz = updateQuiz(MockUserModel, MockQuizModel);
const mockDeleteQuiz = deleteQuiz(MockUserModel, MockQuizModel);

const quizRes = new MockRes();

const newQuiz = {
  ...mockQuizzes[0],
  createdBy: mockUsers[0]._id,
  classroom: mockClassrooms[0]._id,
  title: `${mockUsers[0].name} quiz 1`,
  timeLimit: 4,
  subject: "Mathematics",
};

describe("Quiz Controller Unit Test", () => {
  before(() => {
    mockUsers.forEach((user) => MockUserModel.create(user));
    MockQuizModel.create(newQuiz);
  });

  beforeEach(() => {
    quizRes.reset();
  });

  after(() => {
    mockUsers.forEach((user) => MockUserModel.findByIdAndDelete(user._id));
    mockQuizzes.forEach((quiz) => MockQuizModel.findByIdAndDelete(quiz._id));
  });

  describe("get user quizzes", () => {
    it("should fetch newly created quiz and verify it", async () => {
      try {
        const mockReq = {
          user: mockUsers[0],
        };

        await mockGetUserQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(200);
        expect(quizRes.body).to.be.an("array");

        expect(quizRes.body[0].title).to.equal(newQuiz.title);
        expect(quizRes.body[0].classroom).to.equal(mockClassrooms[0]._id);
        expect(quizRes.body[0].createdBy).to.equal(newQuiz.createdBy);
        expect(quizRes.body[0].timeLimit).to.equal(newQuiz.timeLimit);
        expect(quizRes.body[0].subject).to.equal(newQuiz.subject);
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });

    it("should return empty array as a response payload", async () => {
      try {
        const mockReq = {
          user: mockUsers[1],
        };

        await mockGetUserQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(200);
        expect(quizRes.body).to.be.an("array");
        expect(quizRes.body.length).to.equal(0);
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });

    it("should return `User is not registered` error message", async () => {
      try {
        const unauthorizedUser = { ...mockUsers[0] };
        unauthorizedUser._id = "1234";

        const mockReq = {
          user: unauthorizedUser,
        };

        await mockGetUserQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(403);
        expect(quizRes.body.message).to.include("User is not registered");
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });
  });

  describe("get classroom quizzes", () => {
    it("should fetch an array of classroom quizzes", async () => {
      try {
        const mockReq = {
          user: mockUsers[0],
        };

        await mockGetClassroomQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(200);
        expect(quizRes.body).to.be.an("array");

        expect(quizRes.body[0].title).to.equal(newQuiz.title);
        expect(quizRes.body[0].classroom).to.equal(mockClassrooms[0]._id);
        expect(quizRes.body[0].createdBy).to.equal(newQuiz.createdBy);
        expect(quizRes.body[0].timeLimit).to.equal(newQuiz.timeLimit);
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });

    it("should return empty array as a response payload", async () => {
      try {
        const mockReq = {
          user: mockUsers[1],
        };

        await mockGetClassroomQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(200);
        expect(quizRes.body).to.be.an("array");
        expect(quizRes.body.length).to.equal(0);
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });

    it("should return `User is not registered` error message", async () => {
      try {
        const unauthorizedUser = { ...mockUsers[0] };
        unauthorizedUser._id = "1234";

        const mockReq = {
          user: unauthorizedUser,
        };

        await mockGetClassroomQuizzes(mockReq, quizRes);

        expect(quizRes.statusCode).to.equal(403);
        expect(quizRes.body.message).to.include("User is not registered");
      } catch (error) {
        console.error("Test error: ", error);
        throw error;
      }
    });
  });
});
