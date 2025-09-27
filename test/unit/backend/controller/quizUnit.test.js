import MockModel from "../../../mocks/config/CRUD/mockModel.js";
import MockData from "../../../mocks/config/mockData.js";
import MockRes from "../../../mocks/config/CRUD/mockRes.js";
import {
  getUserQuizzes,
  getClassroomQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../../../../backend/controller/quizzes/quizController.js";
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

const questions = [...mockQuizzes[0]];

const newQuiz = {
  _id: "newQuizId",
  questions,
  createdBy: mockUsers[0]._id,
  classroom: mockClassrooms[1]._id,
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
    MockUserModel.cleanupAll();
    MockQuizModel.cleanupAll();
  });

  describe("get user quizzes", () => {
    it("should fetch newly created quiz and verify it", async () => {
      const mockReq = {
        user: mockUsers[0],
      };
      await mockGetUserQuizzes(mockReq, quizRes);
      expect(quizRes.statusCode).to.equal(200);
      expect(quizRes.body).to.be.an("array");

      const payload = quizRes.body[0];
      const payloadQuestions = payload["questions"];

      expect(payloadQuestions.length).to.equal(newQuiz.questions.length);

      for (const [key, value] of Object.entries(payloadQuestions)) {
        expect(newQuiz.questions[key]).to.equal(value);
      }

      for (const [key, value] of Object.entries(payload)) {
        if (key === "questions") continue;
        expect(newQuiz[key]).to.equal(value);
      }
    });
    it("should return empty array as a response payload", async () => {
      const mockReq = {
        user: mockUsers[1],
      };

      await mockGetUserQuizzes(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(200);
      expect(quizRes.body).to.be.an("array");
      expect(quizRes.body.length).to.equal(0);
    });

    it("should return `User is not registered` error message", async () => {
      const unauthorizedUser = { ...mockUsers[0] };
      unauthorizedUser._id = "1234";
      const mockReq = {
        user: unauthorizedUser,
      };

      await mockGetUserQuizzes(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include("User is not registered");
    });
  });

  describe("get classroom quizzes", () => {
    it("should fetch an array of classroom quizzes", async () => {
      const mockReq = {
        user: mockUsers[1],
      };

      await mockGetClassroomQuizzes(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(200);
      expect(quizRes.body).to.be.an("array");

      for (const [key, value] of Object.entries(quizRes.body[0])) {
        expect(newQuiz[key]).to.equal(value);
      }
    });

    it("should return empty array as a response payload", async () => {
      const mockReq = {
        user: mockUsers[0],
      };

      await mockGetClassroomQuizzes(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(200);
      expect(quizRes.body).to.be.an("array");
      expect(quizRes.body.length).to.equal(0);
    });

    it("should return `User is not registered` error message", async () => {
      const unauthorizedUser = { ...mockUsers[0] };
      unauthorizedUser._id = "1234";

      const mockReq = {
        user: unauthorizedUser,
      };

      await mockGetClassroomQuizzes(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include("User is not registered");
    });
  });

  describe("update user quiz", () => {
    it("should update the quiz and verify it", async () => {
      const updatedTimeLimit = 7;
      const updatedQuestion = "mock update quiz question";

      const updatedQuiz = {
        ...newQuiz,
        timeLimit: updatedTimeLimit,
        question: updatedQuestion,
      };

      const mockReq = {
        params: { id: newQuiz._id },
        user: mockUsers[0],
        body: updatedQuiz,
      };

      await mockUpdateQuiz(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(200);

      for (const [key, value] of Object.entries(quizRes.body)) {
        if (key === "timeLimit") {
          expect(updatedTimeLimit).to.equal(value);
        } else if (key === "question") {
          for (let i = 0; i < value.length; i++) {
            expect(updatedQuestion[i]).to.equal(value[i]);
          }
        } else {
          expect(newQuiz[key]).to.equal(value);
        }
      }
    });

    it("should return `Quiz not found` error message", async () => {
      const updatedTimeLimit = 7;
      const updatedQuestion = "mock update quiz question";

      const updatedQuiz = {
        ...newQuiz,
        timeLimit: updatedTimeLimit,
        question: updatedQuestion,
      };

      const mockReq = {
        params: { id: "4" },
        user: mockUsers[0],
        body: updatedQuiz,
      };

      await mockUpdateQuiz(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include("Quiz not found");
    });

    it("should return `User id is required` error message", async () => {
      const unauthorizedUser = { ...mockUsers[0], _id: undefined };

      const updatedTimeLimit = 7;
      const updatedQuestion = "mock update quiz question";

      const updatedQuiz = {
        ...newQuiz,
        timeLimit: updatedTimeLimit,
        question: updatedQuestion,
      };

      const mockReq = {
        params: { id: newQuiz._id },
        user: unauthorizedUser,
        body: updatedQuiz,
      };

      await mockUpdateQuiz(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include("User id is required");
    });

    it("should return `User is unauthorized` error message", async () => {
      const unauthorizedUser = { ...mockUsers[0], _id: "1234" };

      const updatedTimeLimit = 7;
      const updatedQuestion = "mock update quiz question";

      const updatedQuiz = {
        ...newQuiz,
        timeLimit: updatedTimeLimit,
        question: updatedQuestion,
      };

      const mockReq = {
        params: { id: newQuiz._id },
        user: unauthorizedUser,
        body: updatedQuiz,
      };

      await mockUpdateQuiz(mockReq, quizRes);

      expect(quizRes.statusCode).to.equal(401);
      expect(quizRes.body.message).to.include("User is unauthorized");
    });
  });

  describe("delete user quiz", () => {
    it("should delete the quiz and confirm it", async () => {
      const mockReq = {
        params: { id: newQuiz._id },
        user: mockUsers[0],
      };
      await mockDeleteQuiz(mockReq, quizRes);
      expect(quizRes.statusCode).to.equal(200);
      expect(quizRes.body.message).to.equal(
        `Quiz ${mockReq.params.id} successfully deleted`
      );
      expect(quizRes.body._id).to.equal(mockReq.params.id);
    });

    it("should return `Quiz not found` error message", async () => {
      const mockReq = {
        params: { id: "1234" },
        user: mockUsers[0],
      };
      await mockDeleteQuiz(mockReq, quizRes);
      expect(quizRes.statusCode).to.equal(404);
      expect(quizRes.body.message).to.include("Quiz not found");
    });
    it("should return `User id is required` error message", async () => {
      const unauthorizedUser = { ...mockUsers[0], _id: undefined };
      const mockReq = {
        params: { id: newQuiz._id },
        user: unauthorizedUser,
      };
      await mockDeleteQuiz(mockReq, quizRes);
      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include("User is not registered");
    });

    it("should return `Access denied, quiz does not belong to this user` error message", async () => {
      const mockReq = {
        params: { id: newQuiz._id },
        user: mockUsers[1],
      };
      await mockDeleteQuiz(mockReq, quizRes);
      expect(quizRes.statusCode).to.equal(403);
      expect(quizRes.body.message).to.include(
        "Access denied, quiz does not belong to this user"
      );
    });
  });
});
