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
let noClassroomUser;
const firstClassroom = MockClassroomData.mockClassrooms[0];
const secondClassroom = MockClassroomData.mockClassrooms[1];

describe("Classroom API", () => {
  before(async () => {
    await MockUserModel.create({ ...MockClassroomData.mockUsers[0] });
    await MockUserModel.create({ ...MockClassroomData.mockUsers[2], _id: "2" });

    await MockClassroomModel.create({ ...firstClassroom });
    await MockClassroomModel.create({ ...secondClassroom });

    firstClassroomUser = MockUserModel.storage.users[0];
    noClassroomUser = MockUserModel.storage.users[1];
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
  });
});
