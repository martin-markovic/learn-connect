import { expect } from "chai";
import { expressServer, PORT } from "../../../backend/server.js";
import { io as clientIo } from "socket.io-client";
import mongoose from "mongoose";

describe("Server Tests", () => {
  describe("Server Initialization", () => {
    let serverInstance;

    before((done) => {
      serverInstance = expressServer;
      done();
    });

    it("should start without errors", (done) => {
      expect(serverInstance).to.not.be.undefined;
      done();
    });
  });

  describe("MongoDB Connection", () => {
    before((done) => {
      mongoose
        .connect(process.env.MONGO_URI, {})
        .then(() => done())
        .catch((err) => done(err.message));
    });

    it("should connect to MongoDB successfully", (done) => {
      mongoose.connection.once("open", () => {
        expect(mongoose.connection.readyState).to.equal(1);
        done();
      });
    });

    after((done) => {
      mongoose
        .disconnect()
        .then(() => done())
        .catch((err) => done(err.message));
    });
  });

  describe("Socket.io", () => {
    let client;

    before((done) => {
      client = clientIo.connect(`http://localhost:${PORT}`);
      client.on("connect", done);
    });

    it("should handle connction", (done) => {
      expect(client.connected).to.be.true;
      done();
    });

    after((done) => {
      client.on("disconnect", () => {
        done();
      });
      client.disconnect();
    });
  });
});
