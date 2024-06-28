import request from "supertest";
import { expect } from "chai";
import express from "express";
import quizRoutes from "../../backend/routes/quizzes/quizRoutes.js";

let app;

describe("Quiz Tests", () => {
  before((done) => {
    app = express();

    app.use(express.json());
    app.use("/api/quizzes", quizRoutes);
    done();
  });

  after((done) => {
    console.log(`Quiz Tests finished`);
    done();
  });

  describe("Quiz API", () => {
    let quizID;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/quizzes")
        .send({ title: "New Quiz" });
      quizID = response.body.id;
    });

    describe("createQuiz", () => {
      it("should respond with a status 201 and a message", async () => {
        const res = await request(app).post("/api/quizzes");

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message", "POST /api/quizzes/");
      });
    });

    describe("getQuizzes", () => {
      it("should respond with a status 200 and a message", async () => {
        const res = await request(app).get("/api/quizzes");

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("message", "GET /api/quizzes/");
      });
    });

    describe("getQuiz", () => {
      it("should respond with a status 200 and a message", async () => {
        const res = await request(app).get(`/api/quizzes/${quizID}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property(
          "message",
          `GET /api/quizzes/${quizID}`
        );
      });
    });

    describe("updateQuiz", () => {
      it("should respond with a status 200 and a message", async () => {
        const res = await request(app).put(`/api/quizzes/${quizID}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property(
          "message",
          `PUT /api/quizzes/${quizID}`
        );
      });
    });

    describe("deleteQuiz", () => {
      it("should respond with a status 200 and a message", async () => {
        const res = await request(app).delete(`/api/quizzes/${quizID}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property(
          "message",
          `DELETE /api/quizzes/${quizID}`
        );
      });
    });
  });
});
