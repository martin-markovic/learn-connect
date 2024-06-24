import request from "supertest";
import { expect } from "chai";
import express from "express";
import router from "../../backend/routes/router.js";

const app = express();
app.use(router);

describe("GET /api/users", () => {
  it("should respond with a 200 status and a message", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");
  });
});

describe("GET /", () => {
  it("should respond with a 200 status and a message", async () => {
    const res = await request(app).get("/");
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ message: "Hello App" });
  });
});
