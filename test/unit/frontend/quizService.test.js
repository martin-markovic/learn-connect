import { expect } from "chai";
import axios from "axios";
import quizService from "../../../frontend/src/features/quizzes/quizService.js";
import nock from "nock";

describe("quizService", () => {
  const API_URL = "http://127.0.0.1/api/quizzes/";
  const token = "sample-token";
  const quizData = { title: "Sample Quiz", questions: [] };

  afterEach(() => {
    nock.cleanAll();
  });

  describe("createQuiz", () => {
    it("should create a quiz", async () => {
      const responseData = { id: "1", ...quizData };

      nock(API_URL)
        .post("/")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, responseData);

      try {
        const result = await quizService.createQuiz(quizData, token);
        expect(result).to.eql(responseData);
      } catch (error) {
        console.error("Error during createQuiz test:", error);
      }
    });
  });

  describe("getQuizzes", () => {
    it("should retrieve quizzes", async () => {
      const responseData = [{ id: "1", ...quizData }];

      nock(API_URL)
        .get("/")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, responseData);

      try {
        const result = await quizService.getQuizzes(token);

        expect(result).to.eql(responseData);
      } catch (error) {
        console.error("Error during createQuiz test:", error);
      }
    });
  });

  describe("getQuizById", () => {
    it("should retrieve a quiz by ID successfully", async () => {
      const responseData = { id: "1", ...quizData };

      nock(API_URL)
        .get("/1")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, responseData);

      const result = await quizService.getQuizById("1", token);
      expect(result).to.eql(responseData);
    });
  });

  describe("updateQuiz", () => {
    it("should update a quiz successfully", async () => {
      const responseData = { id: "1", ...quizData };

      nock(API_URL)
        .put("/1")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, responseData);

      const result = await quizService.updateQuiz("1", quizData, token);
      expect(result).to.eql(responseData);
    });
  });

  describe("deleteQuiz", () => {
    it("should delete a quiz successfully", async () => {
      const responseData = { message: "Quiz deleted successfully" };

      nock(API_URL)
        .delete("/1")
        .matchHeader("Authorization", `Bearer ${token}`)
        .reply(200, responseData);

      const result = await quizService.deleteQuiz("1", token);
      expect(result).to.eql(responseData);
    });
  });
});
