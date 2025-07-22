import { expect } from "chai";
import authService from "../../../frontend/src/features/auth/authService.js";
import axios from "axios";
import nock from "nock";

const API_URL = "http://127.0.0.1:8000/api/users";

describe("Auth Service", function () {
  beforeEach(function () {
    global.localStorage = {
      store: {},
      setItem: function (key, value) {
        this.store[key] = value;
      },
      getItem: function (key) {
        return this.store[key] || null;
      },
      removeItem: function (key) {
        delete this.store[key];
      },
    };

    axios.post = function (url, data) {
      if (url === API_URL || url === `${API_URL}/login`) {
        return Promise.resolve({ data: { token: "sample-token" } });
      }
      return Promise.reject(new Error("Invalid URL"));
    };
  });

  describe("registerUser", function () {
    it("should register a user successfully and store data in localStorage", async function () {
      await authService.registerUser({
        email: "user@example.com",
        password: "password",
      });

      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.deep.equal({ token: "sample-token" });
      } catch (error) {
        console.log(error.message);
      }
    });

    it("should handle network errors", async () => {
      nock(API_URL).post("/").replyWithError("Network Error");

      const userData = { email: "user@example.com", password: "password" };
      await authService.registerUser(userData);

      const storedUser = localStorage.getItem("user");
      expect(storedUser).to.be.null;
    });
  });

  describe("loginUser", function () {
    it("should login a user successfully and store data in localStorage", async function () {
      await authService.loginUser({
        email: "user@example.com",
        password: "password",
      });

      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.deep.equal({ token: "sample-token" });
      } catch (error) {
        console.log(error.message);
      }
    });

    it("should handle network errors", async () => {
      nock(API_URL).post("/login").replyWithError("Network Error");

      const userData = { email: "user@example.com", password: "password" };
      const result = await authService.loginUser(userData);

      const storedUser = localStorage.getItem("user");
      expect(storedUser).to.be.null;
      expect(result).to.be.undefined;
    });
  });

  describe("logoutUser", function () {
    it("should remove user data from localStorage", function () {
      localStorage.setItem("user", JSON.stringify({ token: "sample-token" }));
      authService.logoutUser();

      expect(localStorage.getItem("user")).to.be.null;
    });
  });
});
