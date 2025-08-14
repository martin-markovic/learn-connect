import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockData from "../../../mocks/config/mockData.js";
import MockRes from "../../../mocks/config/mockRes.js";
import {
  getExam,
  getExamFeedback,
  getExamScores,
} from "../../../../backend/controller/quizzes/examController.js";
import mongoose from "mongoose";

const MockExamModel = new MockModel("exams");
const MockScoreModel = new MockModel("scores");
const MockUserModel = new MockModel("users");

const mockGetExam = getExam(MockExamModel);
const mockGetExamFeedback = getExamFeedback(MockScoreModel);
const mockGetExamScores = getExamScores(MockScoreModel);

const mockExamData = new MockData();
const examRes = new MockRes();

const hasAnExamUser = {
  ...mockExamData.mockUsers[0],
  _id: new mongoose.Types.ObjectId(),
};
const noExamsUser = {
  ...mockExamData.mockUsers[1],
  _id: new mongoose.Types.ObjectId(),
};
const expiredExamUser = {
  ...mockExamData.mockUsers[2],
  _id: new mongoose.Types.ObjectId(),
};

const ongoingExam = {
  _id: new mongoose.Types.ObjectId(),
  quizId: new mongoose.Types.ObjectId(),
  studentId: hasAnExamUser._id,
  examStart: new Date(Date.now()),
  examFinish: new Date(Date.now() + 60 * 1000 * 10),
  shuffledQuestions: [],
  answers: [],
  isInProgress: true,
};

const expiredExam = {
  _id: new mongoose.Types.ObjectId(),
  quizId: new mongoose.Types.ObjectId(),
  studentId: expiredExamUser._id,
  examStart: new Date(Date.now() - 60 * 1000 * 10),
  examFinish: new Date(Date.now() - 60 * 1000 * 5),
  shuffledQuestions: [],
  answers: [],
  isInProgress: true,
};

const mockScore = {
  _id: new mongoose.Types.ObjectId(),
  user: expiredExamUser._id,
  quiz: { quizId: expiredExam.quizId, quizTitle: "Mock Quiz Title" },
  highScore: 1,
  latestScore: 1,
  examFeedback: {},
};

describe("Exam API", () => {
  before(async () => {
    await MockUserModel.create(hasAnExamUser);
    await MockUserModel.create(noExamsUser);
    await MockUserModel.create(expiredExamUser);

    await MockExamModel.create(ongoingExam);
    await MockExamModel.create(expiredExam);

    await MockScoreModel.create(mockScore);
  });

  beforeEach(() => {
    examRes.reset();
  });

  after(() => {
    MockExamModel.cleanupAll();
  });

  describe("getExam", () => {
    it("should fetch an ongoing exam and verify it", async () => {
      const mockReq = {
        user: { _id: hasAnExamUser._id.toString() },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      for (const [key, value] of Object.entries(examRes.body)) {
        expect(ongoingExam[key]).to.equal(value);
      }
    });

    it("should return an empty object for users without ongoing exams", async () => {
      const mockReq = {
        user: { _id: noExamsUser._id.toString() },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      expect(examRes.body).to.be.an("object").that.is.empty;
    });

    it("should return a `Error fetching exam: User id is required` error message", async () => {
      const mockReq = {
        user: { _id: undefined },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(403);
      expect(examRes.body.message).to.equal(
        "Error fetching exam: User id is required"
      );
    });

    it("should return an empty object as an expired exam payload", async () => {
      const mockReq = {
        user: { _id: expiredExamUser._id.toString() },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      expect(examRes.body).to.be.an("object").that.is.empty;

      // mockGetExam deletes the stored expiredExam document
      await MockExamModel.create(expiredExam);
    });
  });

  describe("getExamFeedback", () => {
    it("should fetch the exam feedback and verify it", async () => {
      const mockReq = {
        params: { quizId: expiredExam.quizId.toString() },
        user: { _id: expiredExamUser._id },
      };

      await mockGetExamFeedback(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      expect(examRes.body._id).to.equal(mockScore._id);
      expect(examRes.body.user.toString()).to.equal(mockScore.user.toString());
    });

    it("should return a `User id is required` error message", async () => {
      const mockReq = {
        params: { quizId: expiredExam.quizId.toString() },
        user: { _id: undefined },
      };

      await mockGetExamFeedback(mockReq, examRes);

      expect(examRes.statusCode).to.equal(403);
      expect(examRes.body.message).to.equal(
        "Error fetching exam feedback: User id is required"
      );
    });

    it("should return a `Missing quiz id` error message", async () => {
      const mockReq = {
        params: { quizId: undefined },
        user: { _id: expiredExamUser._id },
      };

      await mockGetExamFeedback(mockReq, examRes);

      expect(examRes.statusCode).to.equal(400);
      expect(examRes.body.message).to.equal(
        "Error fetching exam feedback: Missing quiz id"
      );
    });

    it("should return a `Exam score not found` error message", async () => {
      const mockReq = {
        params: { quizId: expiredExam.quizId.toString() },
        user: { _id: hasAnExamUser._id },
      };

      await mockGetExamFeedback(mockReq, examRes);

      expect(examRes.statusCode).to.equal(404);
      expect(examRes.body.message).to.equal(
        "Error fetching exam feedback: Exam score not found"
      );
    });
  });
});
