import { expect } from "chai";
import { createMockFactory } from "../../../mocks/config/socket/mockSocketModel.js";
import MockData from "../../../mocks/config/mockData.js";
import { createQuiz } from "../../../../backend/controller/socket/controllers/quizControllers.js";

const userFactory = new createMockFactory("users");
const classroomFactory = new createMockFactory("classrooms");
const quizFactory = new createMockFactory("quizzes");

const quizData = new MockData();

const userStorage = quizData.mockUsers;
const classroomStorage = quizData.mockClassrooms;
const quizStorage = quizData.mockQuizzes;

let mockUser;
let unenrolledUser;
let createdClassroom;

describe("socket quiz controllers", () => {
  before(async () => {
    mockUser = await userFactory.create({
      ...userStorage[0],
    });

    unenrolledUser = await userFactory.create({
      ...userStorage[1],
    });

    createdClassroom = await classroomFactory.create({
      ...classroomStorage[0],
      students: [mockUser._id],
    });

    await userFactory.findByIdAndUpdate(mockUser._id, {
      classrooms: [{ _id: createdClassroom._id }],
    });
  });

  after(async () => {
    userFactory.cleanupAll();
  });

  describe("create quiz", () => {
    it("should create a new quiz and verify it", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 1",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: createdClassroom._id,
        quizData,
      };

      const response = await createQuiz(models, eventData);

      expect(response.title).to.equal(quizData.title);
      expect(response.timeLimit).to.equal(quizData.timeLimit);
      expect(response.classroom).to.equal(quizData.classroomId);
      expect(response.createdBy).to.equal(mockUser._id);

      expect(response.questions.length).to.equal(quizData.questions.length);

      for (let i = 0; i < quizData.questions.length; i++) {
        expect(response.questions[i]).to.deep.equal(quizData.questions[i]);
      }
    });

    it("should return a `Error creating new quiz: Missing models` error message", async () => {
      const models = {
        User: undefined,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: createdClassroom._id,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: Missing models"
        );
      }
    });

    it("should return a `Error creating new quiz: Classroom id is required` error message", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: undefined,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: Classroom id is required"
        );
      }
    });

    it("should return a `Error creating new quiz: Please add all fields` error message", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: undefined,
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: createdClassroom._id,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: Please add all fields"
        );
      }
    });

    it("should return a `Error creating new quiz: User not found` error message", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: "999",
        receiverId: createdClassroom._id,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: User not found"
        );
      }
    });

    it("should return a `Error creating new quiz: Classroom not found` error message", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: "999",
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: "999",
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: Classroom not found"
        );
      }
    });

    it("should return a `Error creating new quiz: User is not enrolled in the classroom` error message", async () => {
      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: unenrolledUser._id,
        receiverId: createdClassroom._id,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          `Error creating new quiz: User is not enrolled in the classroom ${createdClassroom._id}`
        );
      }
    });

    it("should return a `Error creating new quiz: Database failure: unable to create a new quiz` error messages", async () => {
      const originalMethod = quizFactory.create;
      quizFactory.create = () => {
        return null;
      };

      const models = {
        User: userFactory,
        Classroom: classroomFactory,
        Quiz: quizFactory,
      };

      const quizData = {
        title: "mock quiz 2",
        questions: [...quizStorage[0]],
        timeLimit: 4,
        classroomId: createdClassroom._id,
      };

      const eventData = {
        senderId: mockUser._id,
        receiverId: createdClassroom._id,
        quizData,
      };

      try {
        await createQuiz(models, eventData);
      } catch (error) {
        expect(error.message).to.equal(
          "Error creating new quiz: Database failure: unable to create a new quiz"
        );
      }

      quizFactory.create = originalMethod;
    });
  });
});
