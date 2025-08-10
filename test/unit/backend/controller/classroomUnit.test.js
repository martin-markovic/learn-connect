import { expect } from "chai";
import MockData from "../../../mocks/config/mockData.js";
import MockModel from "../../../mocks/config/mockModel.js";
import MockRes from "../../../mocks/config/mockRes.js";

import {
  joinClassroom,
  leaveClassroom,
  getAllClassrooms,
  getUserClassroom,
} from "../../../../backend/controller/classroom/classroomController.js";

const MockUserModel = new MockModel("users");
const MockClassroomModel = new MockModel("classrooms");

const MockClassroomData = new MockData();

const mockJoinClassroom = joinClassroom(MockClassroomModel, MockUserModel);
const mockLeaveClassroom = leaveClassroom(MockClassroomModel, MockUserModel);
const mockGetAllClassrooms = getAllClassrooms(MockUserModel);
const mockGetUserClassroom = getUserClassroom(MockUserModel);

const classroomRes = new MockRes();

let firstClassroomUser;
let enrolledUser;
const firstClassroom = MockClassroomData.mockClassrooms[0];
const secondClassroom = MockClassroomData.mockClassrooms[1];

describe("Classroom API", () => {
  before(async () => {
    await MockUserModel.create({ ...MockClassroomData.mockUsers[0] });
    await MockUserModel.create({ ...MockClassroomData.mockUsers[1], _id: "2" });

    await MockClassroomModel.create({ ...firstClassroom });
    await MockClassroomModel.create({ ...secondClassroom });

    firstClassroomUser = MockUserModel.storage.users[0];
    enrolledUser = MockUserModel.storage.users[1];
  });

  beforeEach(() => {
    classroomRes.reset();
  });

  after(() => {
    MockUserModel.cleanupAll();
    MockClassroomModel.cleanupAll();
  });

  describe("joinClassroom", () => {
    it("should register user in a classroom and verify it", async () => {
      const mockReq = {
        params: { classroomId: "1" },
        user: { _id: firstClassroomUser._id },
      };

      await mockJoinClassroom(mockReq, classroomRes);

      expect(classroomRes.statusCode).to.equal(200);
      expect(classroomRes.body.message).to.equal(
        "User joined classroom successfully"
      );
      expect(classroomRes.body.updatedClassroom._id).to.equal(
        firstClassroom._id
      );
      expect(classroomRes.body.updatedClassroom.name).to.equal(
        firstClassroom.name
      );
      expect(classroomRes.body.updatedClassroom.subject).to.equal(
        firstClassroom.subject
      );
      expect(classroomRes.body.updatedClassroom.limit).to.equal(
        firstClassroom.limit
      );
      expect(classroomRes.body.updatedClassroom.students[0]).to.equal(
        firstClassroomUser._id
      );
    });

    it("should return a `Classroom ID is required` error message", async () => {
      const mockReq = {
        params: { classroomId: undefined },
        user: { _id: firstClassroomUser._id },
      };

      await mockJoinClassroom(mockReq, classroomRes);

      expect(classroomRes.statusCode).to.equal(400);
      expect(classroomRes.body.message).to.equal("Classroom ID is required");
    });

    it("should return a `User id is required` error message", async () => {
      const mockReq = {
        params: { classroomId: firstClassroom._id },
        user: { _id: undefined },
      };

      await mockJoinClassroom(mockReq, classroomRes);

      expect(classroomRes.statusCode).to.equal(403);
      expect(classroomRes.body.message).to.equal("User id is required");
    });

    it("should return a `Classroom not found` error message", async () => {
      const mockReq = {
        params: { classroomId: "99" },
        user: { _id: firstClassroomUser._id },
      };

      await mockJoinClassroom(mockReq, classroomRes);

      expect(classroomRes.statusCode).to.equal(404);
      expect(classroomRes.body.message).to.equal("Classroom not found");
    });

    it("should return a `User is already in this classroom` error message", async () => {
      const mockReq = {
        params: { classroomId: secondClassroom._id },
        user: { _id: enrolledUser._id },
      };

      await mockJoinClassroom(mockReq, classroomRes);

      expect(classroomRes.statusCode).to.equal(400);
      expect(classroomRes.body.message).to.equal(
        "User is already in this classroom"
      );
    });
  });
});
