import { expect } from "chai";
import { server, PORT } from "../../backend/server.js";
import { io as clientIo } from "socket.io-client";

describe("Server Tests", () => {
  it("Server should start without errors", (done) => {
    expect(server).to.not.be.undefined;
    done();
  });

  it("Socket.io should handle connection and disconnection", (done) => {
    const client = clientIo.connect(`http://localhost:${PORT}`);

    client.on("connect", () => {
      console.log("Client connected to socket.io");
      client.disconnect();
    });

    client.on("disconnect", () => {
      console.log("Client disconnected from socket.io");
      done();
    });
  });
});
