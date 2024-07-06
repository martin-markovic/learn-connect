import request from "supertest";
import { expect } from "chai";
import createMockServer from "../../mocks/mockServer.js";
import mockQuizRoutes from "../../mocks/routes/quizzes/mockQuizRoutes.js";
import testDB from "../../mocks/config/mockDatabase.js";

let app;
let server;
let existingUser = testDB.storage.users[0];
let unauthorizedUser = testDB.storage.users[1];
let newQuiz = testDB.storage.quizzes[0];
let updatedQuiz = {
  question: "Updated question",
  choices: ["new choice", "new choice", "new choice"],
  answer: "new answer",
};
let mockToken = existingUser.token;
let unauthorizedToken = unauthorizedUser.token;

describe("Quizz API", () => {
  before(() => {
    app = createMockServer();
    server = app.listen(4001, () => {
      console.log("Test server running on port 4001");
    });

    app.use("/api/quizzes/", mockQuizRoutes);
  });

  after(() => {
    server.close(() => {
      console.log("Test server stopped");
    });
  });

  describe("Quiz API", () => {
    describe("createQuiz", () => {
      it("should create a new quiz and verify it", async () => {
        const res = await request(app)
          .post("/api/quizzes/")
          .send(newQuiz)
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("question", newQuiz.question);
        expect(res.body)
          .to.have.property("choices")
          .that.deep.equals(newQuiz.choices);
        expect(res.body).to.have.property("answer", newQuiz.answer);
      });

      it("should return a 401 status and a message no token", async () => {
        const res = await request(app).post("/api/quizzes/").send(newQuiz);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property(
          "message",
          "Not authorized, no token"
        );
      });

      it("should return a 401 status and a message user not authorized", async () => {
        const res = await request(app)
          .post("/api/quizzes/")
          .send(newQuiz)
          .set("Authorization", `Bearer ${unauthorizedToken}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("message", "User not authorized");
      });

      it("should return a 400 status and a message please add all fields", async () => {
        const res = await request(app)
          .post("/api/quizzes/")
          .send({
            question: "This is a question",
            answer: "This is an answer",
          })
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("message", "Please add all fields");
      });
    });

    describe("getQuizzes", () => {
      it("should get all quizzes and verify them", async () => {
        const res = await request(app)
          .get("/api/quizzes/")
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("quizzes").that.is.an("array");
        expect(res.body.quizzes).to.deep.equal([testDB.storage.quizzes[0]]);
      });

      it("should return a 401 status and a message no token", async () => {
        const res = await request(app).get("/api/quizzes/");

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property(
          "message",
          "Not authorized, no token"
        );
      });

      it("should return a 401 status and a message user not authorized", async () => {
        const res = await request(app)
          .get("/api/quizzes/")
          .set("Authorization", `Bearer ${unauthorizedToken}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("message", "User not authorized");
      });
    });

    describe("getQuizById", () => {
      it("should get a quiz by ID and verify it", async () => {
        const res = await request(app)
          .get(`/api/quizzes/${newQuiz.id}`)
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("user", existingUser.id);
        expect(res.body).to.have.property("question", newQuiz.question);
        expect(res.body)
          .to.have.property("choices")
          .that.deep.equals(newQuiz.choices);
        expect(res.body).to.have.property("answer", newQuiz.answer);
      });

      it("should return a 401 status and a message no token", async () => {
        const res = await request(app).get("/api/quizzes/");

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property(
          "message",
          "Not authorized, no token"
        );
      });

      it("should return a 404 status and a message Quiz not found", async () => {
        const res = await request(app)
          .get("/api/quizzes/9999")
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(404);
        expect(res.body).to.have.property("message", "Quiz not found");
      });

      it("should return a 401 status and a message user not authorized", async () => {
        const res = await request(app)
          .post("/api/quizzes/")
          .send(newQuiz)
          .set("Authorization", `Bearer ${unauthorizedToken}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("message", "User not authorized");
      });
    });

    describe("updateQuiz", () => {
      it("should update a quiz and verify it", async () => {
        const res = await request(app)
          .put(`/api/quizzes/${newQuiz.id}`)
          .send(updatedQuiz)
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("user", existingUser.id);
        expect(res.body).to.have.property("question", updatedQuiz.question);
        expect(res.body)
          .to.have.property("choices")
          .that.deep.equals(updatedQuiz.choices);
        expect(res.body).to.have.property("answer", updatedQuiz.answer);
      });

      it("should return a 401 status and a message no token", async () => {
        const res = await request(app)
          .put(`/api/quizzes/${newQuiz.id}`)
          .send(updatedQuiz);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property(
          "message",
          "Not authorized, no token"
        );
      });

      it("should return a 404 status and a message Quiz not found", async () => {
        const res = await request(app)
          .put("/api/quizzes/9999")
          .send(updatedQuiz)
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(404);
        expect(res.body).to.have.property("message", "Quiz not found");
      });

      it("should return a 401 status and a message user not authorized", async () => {
        const res = await request(app)
          .put("/api/quizzes/9999")
          .send(updatedQuiz)
          .set("Authorization", `Bearer ${unauthorizedToken}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("message", "User not authorized");
      });
    });

    describe("deleteQuiz", () => {
      it("should delete a quiz and verify it", async () => {
        const res = await request(app)
          .delete(`/api/quizzes/${newQuiz.id}`)
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("id", newQuiz.id);
      });

      it("should return a 401 status and a message no token", async () => {
        const res = await request(app).delete(`/api/quizzes/${newQuiz.id}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property(
          "message",
          "Not authorized, no token"
        );
      });

      it("should return a 404 status and a message Quiz not found", async () => {
        const res = await request(app)
          .delete("/api/quizzes/9999")
          .set("Authorization", `Bearer ${mockToken}`);

        expect(res.status).to.equal(404);
        expect(res.body).to.have.property("message", "Quiz not found");
      });

      it("should return a 401 status and a message user not authorized", async () => {
        const res = await request(app)
          .delete(`/api/quizzes/${newQuiz.id}`)
          .set("Authorization", `Bearer ${unauthorizedToken}`);

        expect(res.status).to.equal(401);
        expect(res.body).to.have.property("message", "User not authorized");
      });
    });
  });
});
