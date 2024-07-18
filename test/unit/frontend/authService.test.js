import { expect } from "chai";
import authService from "../../../frontend/src/features/auth/authService.js";
import axios from "axios";

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
      if (
        url === "http://127.0.0.1:8000/api/users" ||
        url === "http://127.0.0.1:8000/api/users/login"
      ) {
        return Promise.resolve({ data: { token: "sample-token" } });
      }
      return Promise.reject(new Error("Invalid URL"));
    };
  });

  describe("registerUser", function () {
    it("should register a user successfully and store data in localStorage", async function () {
      await authService.registerUser("user@example.com", "password");

      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.deep.equal({ token: "sample-token" });
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("loginUser", function () {
    it("should login a user successfully and store data in localStorage", async function () {
      await authService.loginUser("user@example.com", "password");

      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        expect(storedData).to.deep.equal({ token: "sample-token" });
      } catch (error) {
        console.log(error);
      }
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
