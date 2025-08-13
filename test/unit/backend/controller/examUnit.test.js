import { expect } from "chai";
import MockModel from "../../../mocks/config/mockModel.js";
import MockData from "../../../mocks/config/mockData.js";
import MockRes from "../../../mocks/config/mockRes.js";
import {
  getExam,
  getExamFeedback,
  getExamScores,
} from "../../../../backend/controller/quizzes/examController.js";

const MockExamModel = new MockModel("exams");
const MockScoreModel = new MockModel("scores");
const MockUserModel = new MockModel("users");

const mockGetExam = getExam(MockExamModel);
const mockGetExamFeedback = getExamFeedback(MockScoreModel);
const mockGetExamScores = getExamScores(MockScoreModel);

const mockExamData = new MockData();
const examRes = new MockRes();

const mockQuiz = mockExamData.mockQuizzes[0];

const hasAnExamUser = mockExamData.mockUsers[0];
const noExamsUser = mockExamData.mockUsers[1];
const expiredExamUser = mockExamData.mockUsers[2];

const ongoingExam = {
  _id: "1",
  quizId: mockQuiz._id,
  studentId: hasAnExamUser._id,
  examStart: new Date(Date.now()),
  examFinish: new Date(Date.now() + 60 * 1000 * 10),
  shuffledQuestions: [],
  answers: [],
  isInProgress: true,
};

const expiredExam = {
  _id: "2",
  quizId: mockQuiz._id,
  studentId: expiredExamUser._id,
  examStart: new Date(Date.now() - 60 * 1000 * 10),
  examFinish: new Date(Date.now() - 60 * 1000 * 5),
  shuffledQuestions: [],
  answers: [],
  isInProgress: true,
};

describe("Exam API", () => {
  before(async () => {
    await MockUserModel.create(hasAnExamUser);
    await MockUserModel.create(noExamsUser);
    await MockUserModel.create(expiredExamUser);

    await MockExamModel.create(ongoingExam);
    await MockExamModel.create(expiredExam);
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
        user: { _id: hasAnExamUser._id },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      for (const [key, value] of Object.entries(examRes.body)) {
        expect(ongoingExam[key]).to.equal(value);
      }
    });

    it("should return an empty object for users without ongoing exams", async () => {
      const mockReq = {
        user: { _id: noExamsUser._id },
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
        user: { _id: expiredExamUser._id },
      };

      await mockGetExam(mockReq, examRes);

      expect(examRes.statusCode).to.equal(200);
      expect(examRes.body).to.be.an("object").that.is.empty;

      // mockGetExam deletes the stored expiredExam document
      await MockExamModel.create(expiredExam);
    });
  });
});
