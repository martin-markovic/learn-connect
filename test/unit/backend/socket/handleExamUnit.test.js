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

  describe("create exam", () => {
    it("should create a new exam and verify it", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };
      const eventData = { senderId: hasExamUser._id, quizId: createdQuiz._id };

      const response = await createExam(models, eventData);

      expect(response._id).to.equal("frdoc_1");
      expect(response.quizId).to.equal(createdQuiz._id);
      expect(response.studentId).to.equal(hasExamUser._id);
      expect(response.studentId).to.equal(hasExamUser._id);
      expect(response.examStart).to.not.be.null;

      const examStart = new Date(response.examStart);
      const examFinish = new Date(response.examFinish);

      const timeDifferenceMs = examFinish - examStart;
      const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);

      expect(timeDifferenceMinutes).to.equal(quizTimeLimit);
    });

    it("should return a `Missing models` error message", async () => {
      const models = {
        Quiz: undefined,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const eventData = { senderId: hasExamUser._id, quizId: createdQuiz._id };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Missing models");
      }
    });
    it("should return a `User not authorized` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const eventData = { senderId: undefined, quizId: createdQuiz._id };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("User not authorized");
      }
    });

    it("should return a `Quiz not found` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const eventData = { senderId: hasExamUser._id, quizId: undefined };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Quiz not found");
      }
    });

    it("should return a `Classroom not found` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };
      const originalClassroom = classroomFactory.getStorage().classrooms;

      await classroomFactory.deleteOne({ _id: originalClassroom._id });

      const eventData = { senderId: noExamUser._id, quizId: createdQuiz._id };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("Classroom not found");
      }

      await classroomFactory.create(originalClassroom);
    });

    it("should return a `User is not enrolled in required classroom` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const eventData = {
        senderId: unEnrolledUser._id,
        quizId: createdQuiz._id,
      };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "User is not enrolled in required classroom"
        );
      }
    });

    it("should return a `User is already participating in an exam` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const eventData = {
        senderId: hasExamUser._id,
        quizId: createdQuiz._id,
      };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "User is already participating in an exam"
        );
      }
    });

    it("should return a `Database Failure: Unable to create new exam payload` error message", async () => {
      const models = {
        Quiz: quizFactory,
        Classroom: classroomFactory,
        Exam: examFactory,
      };

      const originalMethod = examFactory.save;
      examFactory.save = () => {
        return null;
      };

      const examFound = examFactory.getStorage().exams[1];

      await examFactory.deleteOne({ _id: examFound._id });

      const eventData = {
        senderId: noExamUser._id,
        quizId: createdQuiz._id,
      };

      try {
        await createExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Database Failure: Unable to create new exam payload"
        );
      }

      examFactory.save = originalMethod;
    });
  });

