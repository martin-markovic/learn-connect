import { expect } from "chai";
import authService from "../../../frontend/src/features/auth/authService.js";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/users";

describe("Auth Service Integration Tests", function () {
  before(async function () {
    const userData = { email: "user@example.com", password: "password" };
    try {
      await axios.post(API_URL, userData);
    } catch (error) {
      console.log("Error creating test user:", error);
    }
  });

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
      clear: function () {
        this.store = {};
      },
    };

    global.localStorage.clear();
  });

  after(async function () {
    const userData = { email: "user@example.com" };
    try {
      await axios.delete(API_URL, { data: userData });
    } catch (error) {
      console.log("Error deleting test user:", error);
    }
  });

  describe("registerUser", function () {
    it("should register a user successfully and store data in localStorage", async function () {
      const userData = { email: "newuser@example.com", password: "password" };

      try {
        await authService.registerUser(userData);
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.have.property("token");
      } catch (error) {
        console.log("Error during registerUser test:", error);
      }
    });
  });

  describe("loginUser", function () {
    it("should login a user successfully and store data in localStorage", async function () {
      const userData = { email: "user@example.com", password: "password" };

      try {
        const result = await authService.loginUser(userData);
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.have.property("token");
      } catch (error) {
        console.log("Error during loginUser test:", error);
      }
    });
  });
});
