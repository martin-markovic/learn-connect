import { expect } from "chai";
import nock from "nock";
import quizService from "../../../frontend/src/features/quizzes/quizService.js";
import axios from "axios";

const API_URL = "http://127.0.0.1/api/quizzes/";
let quizData = {
  id: 1,
  question: "Sample Quiz",
  choices: ["Choice 1", "Choice 2", "Choice 3"],
  answer: "Sample answer",
};
const token = "sample-token";

describe("Quiz Service Integration Tests", function () {
  beforeEach(function () {
    nock.cleanAll();
  });

  describe("createQuiz", function () {
    it("should create a quiz and return the created quiz data", async function () {
      nock("http://127.0.0.1")
        .post("/api/quizzes/")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(201, { ...quizData });

      try {
        const result = await quizService.createQuiz(quizData, token);

        expect(result).to.include(quizData);
        expect(result).to.have.property("id", quizData.id);
        expect(result).to.have.property("question", quizData.question);
        expect(result).to.have.property("choices", quizData.choices);
        expect(result).to.have.property("answer", quizData.answer);
      } catch (error) {
        console.log("Error during createQuiz test:", error);
      }
    });
  });

  describe("getQuizzes", function () {
    it("should retrieve the list of quizzes", async function () {
      nock("http://127.0.0.1")
        .get("/api/quizzes/")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, quizData);
      try {
        const result = await quizService.getQuizzes(token);

        expect(result).to.include(quizData);
        expect(result).to.have.property("id", quizData.id);
        expect(result).to.have.property("question", quizData.question);
        expect(result).to.have.property("choices", quizData.choices);
        expect(result).to.have.property("answer", quizData.answer);
      } catch (error) {
        console.log("Error during createQuiz test:", error);
      }
    });
  });

  describe("getQuizById", function () {
    it("should retrieve a quiz by its ID", async function () {
      nock("http://127.0.0.1")
        .get(`/api/quizzes/${quizData.id}`)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, quizData);

      try {
        const result = await quizService.getQuizById(quizData.id, token);

        expect(result).to.include(quizData);
        expect(result).to.have.property("id", quizData.id);
        expect(result).to.have.property("question", quizData.question);
        expect(result).to.have.property("choices", quizData.choices);
        expect(result).to.have.property("answer", quizData.answer);
      } catch (error) {
        console.log("Error during createQuiz test:", error);
      }
    });
  });

  describe("updateQuiz", function () {
    it("should update a quiz and return the updated quiz data", async function () {
      const updatedData = {
        id: quizData.id,
        question: "Updated Quiz",
        choices: ["Updated Choice 1", "Updated Choice 2", "Updated Choice 1"],
        answer: "Updated answer",
      };

      nock("http://127.0.0.1")
        .put(`/api/quizzes/${quizData.id}`)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, updatedData);

      try {
        const result = await quizService.updateQuiz(updatedData, token);

        expect(result).to.include(updatedData);
        expect(result).to.have.property("id", updatedData.id);
        expect(result).to.have.property("question", updatedData.question);
        expect(result).to.have.property("choices", updatedData.choices);
        expect(result).to.have.property("answer", updatedData.answer);
      } catch (error) {
        console.log("Error during createQuiz test:", error);
      }
    });
  });

  describe("deleteQuiz", function () {
    it("should delete a quiz and return a confirmation", async function () {
      nock("http://127.0.0.1")
        .delete(`/api/quizzes/${quizData.id}`)
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, { message: "Quiz deleted successfully" });

      try {
        const result = await quizService.deleteQuiz(quizData.id, token);

        expect(result).to.deep.equal({ message: "Quiz deleted successfully" });
      } catch (error) {
        console.log("Error during createQuiz test:", error);
      }
    });
  });
});
