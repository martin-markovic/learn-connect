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

  describe("update exam", () => {
    it("should update the exam and verify it", async () => {
      const models = { Exam: examFactory };

      const updatedData = "test data";
      const testIndex = 1;
      const existingExam = examFactory.getStorage().exams[0];

      const examUpdates = { choiceIndex: testIndex, choiceData: updatedData };

      const eventData = { senderId: hasExamUser._id, examData: examUpdates };

      const response = await updateExam(models, eventData);

      for (const [key, value] of Object.entries(response)) {
        if (key === "answers") {
          expect(response[key][testIndex]).to.equal(updatedData);
        } else {
          if (key in existingExam) {
            expect(existingExam[key]).to.equal(value);
          }
        }
      }
    });

    it("should return a `update exam error: Missing models` error message", async () => {
      const models = { Exam: undefined };

      const updatedAnswer = "test data 2";
      const testIndex = 1;

      const examFound = examFactory.getStorage().exams[0];
      const currentAnswer = examFound.answers[testIndex];

      const examUpdates = { choiceIndex: testIndex, choiceData: updatedAnswer };

      const eventData = { senderId: hasExamUser._id, examData: examUpdates };

      try {
        await updateExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("update exam error: Missing models");
      }

      expect(currentAnswer).to.not.equal(updatedAnswer);
    });

    it("should return a `update exam error: Please provide valid exam data` error message", async () => {
      const models = { Exam: examFactory };

      const updatedAnswer = "test data 2";
      const testIndex = 1;

      const examFound = examFactory.getStorage().exams[0];
      const currentAnswer = examFound.answers[testIndex];

      const eventData = { senderId: hasExamUser._id, examData: undefined };

      try {
        await updateExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "update exam error: Please provide valid exam data"
        );
      }

      expect(currentAnswer).to.not.equal(updatedAnswer);
    });

    it("should return a `update exam error: Exam not found` error message", async () => {
      const models = { Exam: examFactory };

      const updatedAnswer = "test data 2";
      const testIndex = 1;

      const examFound = examFactory.getStorage().exams[0];
      const currentAnswer = examFound.answers[testIndex];

      const examUpdates = { choiceIndex: testIndex, choiceData: updatedAnswer };

      const eventData = { senderId: "999", examData: examUpdates };

      try {
        await updateExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("update exam error: Exam not found");
      }

      expect(currentAnswer).to.not.equal(updatedAnswer);
    });

    it("should return a `update exam error: Exam has expired` error message", async () => {
      const models = { Exam: examFactory };

      const updatedAnswer = "test data 2";
      const testIndex = 1;

      const examData = { senderId: hasExamUser._id, quizId: createdQuiz._id };

      await finishExam(
        {
          models: { Exam: examFactory, Quiz: quizFactory, Score: scoreFactory },
        },
        examData
      );

      const examUpdates = { choiceIndex: testIndex, choiceData: updatedAnswer };

      const eventData = { senderId: hasExamUser._id, examData: examUpdates };

      try {
        await updateExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal("update exam error: Exam has expired");
      }
    });

    it("should return a `update exam error: Database failure: unable to update exam` error message", async () => {
      const currentMethod = examFactory.findByIdAndUpdate;

      examFactory.findByIdAndUpdate = () => {
        return null;
      };

      const models = { Exam: examFactory };

      const updatedAnswer = "test data 2";
      const testIndex = 1;

      const examUpdates = { choiceIndex: testIndex, choiceData: updatedAnswer };

      const eventData = { senderId: hasExamUser._id, examData: examUpdates };

      try {
        await updateExam(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "update exam error: Database failure: unable to update exam"
        );
      }

      examFactory.findByIdAndUpdate = currentMethod;
    });
  });
});
