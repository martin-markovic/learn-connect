import request from "supertest";
import { expect } from "chai";
import createMockServer from "../../mocks/mockServer.js";
import mockQuizRoutes from "../../mocks/routes/quizzes/mockQuizRoutes.js";
import testDB from "../../mocks/config/mockDatabase.js";

let app;
let user;
// add unauthorizedUser
let newQuiz = testDB.storage.quizzes[0];
// let updatedQuiz = testDB.storage.quizzes[1]

describe("Quizz API", () => {
  before(() => {
    app = createMockServer();
    app.listen(4001, () => {
      console.log("Test server running on port 4001");
    });

    app.use("/api/quizzes/", mockQuizRoutes);
  });

  describe("Quiz API", () => {
    describe("createQuiz", () => {
      it("should create a new quiz and verify it", async () => {
        const res = await request(app).post("/api/quizzes/");

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message", "createQuiz");
      });
    });

    describe("getQuizzes", () => {
      it("should get all quizzes and verify them", async () => {
        const res = await request(app).get("/api/quizzes/");

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message", "getQuizzes");
      });
    });

    describe("getQuizById", () => {
      it("should get a quiz by ID and verify it", async () => {
        const res = await request(app)
          .get(`/api/quizzes/${newQuiz.id}`)
          .send(newQuiz);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message", "getQuizById");
      });
    });

    describe("updateQuiz", () => {
      it("should update a quiz and verify it", async () => {
        const res = await request(app)
          .put(`/api/quizzes/${newQuiz.id}`)
          .send(newQuiz);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message", "updateQuiz");
      });
    });

    describe("deleteQuiz", () => {
      it("should delete a quiz and verify it", async () => {
        const res = await request(app)
          .delete(`/api/quizzes/${newQuiz.id}`)
          .send(newQuiz);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message", "deleteQuiz");
      });
    });
  });
});
